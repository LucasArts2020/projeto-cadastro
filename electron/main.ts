import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import iniciarBanco from "./sql/dbManager";
import path from "node:path";

// --- 1. ATUALIZAÇÃO DA INTERFACE (Adicionado diasSemana e horarioAula) ---
interface Student {
  id?: number;
  nome: string;
  rg: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  telefone2?: string;
  endereco: string;
  fotoUrl?: string | null;
  turma: string;
  valorMatricula: number;
  planoMensal: string;
  valorMensalidade: number;
  formaPagamento: string;
  diaVencimento: number | string;

  // NOVOS CAMPOS
  diasSemana?: string[]; // No banco será salvo como string, mas aqui entra como array
  horarioAula?: string;

  createdAt?: string;
}

type SqlValue = number | string | Uint8Array | null;

interface QueryExecResult {
  columns: string[];
  values: SqlValue[][];
}

interface SqlStatement {
  run(params?: Record<string, SqlValue> | SqlValue[]): void;
  free(): void;
}

interface Database {
  run(sql: string, params?: Record<string, SqlValue> | SqlValue[]): Database;
  exec(sql: string): QueryExecResult[];
  prepare(sql: string): SqlStatement;
  export(): Uint8Array;
}

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const initSqlJs = require("sql.js");

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let db: Database | null = null;
const dbPath = path.join(process.env.APP_ROOT, "dados.sqlite");

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 1000,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.whenReady().then(async () => {
  await iniciarBanco();
  createWindow();
});

interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- 3. LEITURA DOS DADOS (Convertendo de volta para Array) ---
ipcMain.handle("get-alunos", (): Student[] => {
  try {
    if (!db) return [];
    const result = db.exec("SELECT * FROM students ORDER BY id DESC");
    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;

    const alunos: Student[] = values.map((row) => {
      const obj: any = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });

      // CONVERSÃO IMPORTANTE:
      // O banco devolve string '["Seg","Qua"]', o front precisa de array ["Seg","Qua"]
      let diasParsed: string[] = [];
      try {
        if (obj.diasSemana) {
          diasParsed = JSON.parse(obj.diasSemana);
        }
      } catch (e) {
        diasParsed = [];
      }

      return {
        ...obj,
        telefone2: obj.telefoneEmergencia,
        fotoUrl: obj.foto,
        diasSemana: diasParsed, // Campo convertido
        horarioAula: obj.horarioAula, // Campo simples
      } as Student;
    });

    return alunos;
  } catch (error: unknown) {
    console.error("Erro ao buscar:", error);
    return [];
  }
});

// --- 4. SALVAMENTO DOS DADOS (Convertendo Array para String) ---
ipcMain.handle(
  "add-aluno",
  (event: IpcMainInvokeEvent, dados: Student): ApiResponse => {
    try {
      if (!db) return { success: false, error: "Banco não iniciado" };

      const diaVencimentoSafe = parseInt(String(dados.diaVencimento || 0));

      // CONVERSÃO IMPORTANTE: Array -> JSON String
      const diasSemanaString = JSON.stringify(dados.diasSemana || []);

      const stmt = db.prepare(`
      INSERT INTO students (
        nome, rg, cpf, dataNascimento, telefone, telefoneEmergencia, 
        endereco, foto, turma, valorMatricula, planoMensal, 
        valorMensalidade, formaPagamento, diaVencimento,
        diasSemana, horarioAula
      ) VALUES (
        $nome, $rg, $cpf, $dataNascimento, $telefone, $telefoneEmergencia, 
        $endereco, $foto, $turma, $valorMatricula, $planoMensal, 
        $valorMensalidade, $formaPagamento, $diaVencimento,
        $diasSemana, $horarioAula
      )
    `);

      const params: Record<string, SqlValue> = {
        $nome: dados.nome,
        $rg: dados.rg,
        $cpf: dados.cpf,
        $dataNascimento: dados.dataNascimento,
        $telefone: dados.telefone,
        $telefoneEmergencia: dados.telefone2 || "",
        $endereco: dados.endereco,
        $foto: dados.fotoUrl || null,
        $turma: dados.turma,
        $valorMatricula: dados.valorMatricula,
        $planoMensal: dados.planoMensal,
        $valorMensalidade: dados.valorMensalidade,
        $formaPagamento: dados.formaPagamento,
        $diaVencimento: diaVencimentoSafe,

        // Novos valores
        $diasSemana: diasSemanaString,
        $horarioAula: dados.horarioAula || "",
      };

      stmt.run(params);
      stmt.free();
      salvarBanco();

      return { success: true };
    } catch (error: unknown) {
      let msg = "Erro desconhecido";
      if (error instanceof Error) msg = error.message;
      console.error("Erro ao inserir:", msg);
      return { success: false, error: msg };
    }
  },
);
