import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

// --- 1. AJUSTE NA INTERFACE PARA BATER COM O FRONT-END ---
interface Student {
  id?: number;
  nome: string;
  rg: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  telefone2?: string; // Alterado de telefoneEmergencia para telefone2
  endereco: string;
  fotoUrl?: string | null; // Alterado de foto para fotoUrl
  turma: string;
  valorMatricula: number;
  planoMensal: string;
  valorMensalidade: number;
  formaPagamento: string;
  diaVencimento: number | string; // Aceita string caso venha do input
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

async function iniciarBanco(): Promise<void> {
  try {
    const wasmPath = path.join(
      process.env.APP_ROOT,
      "node_modules",
      "sql.js",
      "dist",
      "sql-wasm.wasm",
    );

    const wasmBuffer = fs.readFileSync(wasmPath);

    const SQL = await initSqlJs({
      wasmBinary: wasmBuffer,
    });

    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer) as Database;
      console.log("Banco de dados carregado com sucesso.");
    } else {
      db = new SQL.Database() as Database;
      db?.run(`
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          rg TEXT,
          cpf TEXT UNIQUE NOT NULL,
          dataNascimento TEXT NOT NULL,
          telefone TEXT NOT NULL,
          telefoneEmergencia TEXT NOT NULL,
          endereco TEXT NOT NULL,
          foto TEXT,
          turma TEXT NOT NULL,
          valorMatricula REAL NOT NULL,
          planoMensal TEXT NOT NULL,
          valorMensalidade REAL NOT NULL,
          formaPagamento TEXT NOT NULL,
          diaVencimento INTEGER NOT NULL,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        turma TEXT NOT NULL,
        data_aula TEXT NOT NULL, -- Formato YYYY-MM-DD
        descricao TEXT
  );

        CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        status TEXT CHECK(status IN ('presente', 'falta', 'justificado')) NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (class_id) REFERENCES classes(id)
  );
      `);
      salvarBanco();
      console.log("Novo banco de dados criado.");
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("ERRO CRÍTICO NO BANCO:", err.message);
    } else {
      console.error("ERRO DESCONHECIDO NO BANCO:", err);
    }
  }
}

function salvarBanco(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

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

      // Conversão na volta (banco -> front)
      // Ajusta o nome das chaves para o front entender
      return {
        ...obj,
        telefone2: obj.telefoneEmergencia,
        fotoUrl: obj.foto,
      } as Student;
    });

    return alunos;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Erro ao buscar:", error.message);
    }
    return [];
  }
});

ipcMain.handle(
  "add-aluno",
  (event: IpcMainInvokeEvent, dados: Student): ApiResponse => {
    try {
      if (!db) return { success: false, error: "Banco não iniciado" };

      // Validação básica para evitar erro de NaN
      const diaVencimentoSafe = parseInt(String(dados.diaVencimento || 0));

      const stmt = db.prepare(`
      INSERT INTO students (
        nome, rg, cpf, dataNascimento, telefone, telefoneEmergencia, 
        endereco, foto, turma, valorMatricula, planoMensal, 
        valorMensalidade, formaPagamento, diaVencimento
      ) VALUES (
        $nome, $rg, $cpf, $dataNascimento, $telefone, $telefoneEmergencia, 
        $endereco, $foto, $turma, $valorMatricula, $planoMensal, 
        $valorMensalidade, $formaPagamento, $diaVencimento
      )
    `);

      // --- 2. CORREÇÃO CRÍTICA AQUI ---
      const params: Record<string, SqlValue> = {
        $nome: dados.nome,
        $rg: dados.rg,
        $cpf: dados.cpf,
        $dataNascimento: dados.dataNascimento,
        $telefone: dados.telefone,

        // Mapeia 'telefone2' (front) para 'telefoneEmergencia' (banco)
        // Se vier vazio, manda string vazia "" para não quebrar o NOT NULL
        $telefoneEmergencia: dados.telefone2 || "",

        $endereco: dados.endereco,

        // Mapeia 'fotoUrl' (front) para 'foto' (banco)
        $foto: dados.fotoUrl || null,

        $turma: dados.turma,
        $valorMatricula: dados.valorMatricula,
        $planoMensal: dados.planoMensal,
        $valorMensalidade: dados.valorMensalidade,
        $formaPagamento: dados.formaPagamento,
        $diaVencimento: diaVencimentoSafe,
      };

      stmt.run(params);
      stmt.free();

      salvarBanco();

      return { success: true };
    } catch (error: unknown) {
      let errorMessage = "Erro desconhecido";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Erro ao inserir:", errorMessage);

        // Dica extra para debugar se der erro de constraint
        if (errorMessage.includes("NOT NULL constraint failed")) {
          return {
            success: false,
            error: "Preencha todos os campos obrigatórios.",
          };
        }
      }
      return { success: false, error: errorMessage };
    }
  },
);
