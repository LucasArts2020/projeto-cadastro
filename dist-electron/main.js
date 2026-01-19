import { app, ipcMain, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
const require$1 = createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
const initSqlJs = require$1("sql.js");
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let db = null;
const dbPath = path.join(process.env.APP_ROOT, "dados.sqlite");
async function iniciarBanco() {
  try {
    const wasmPath = path.join(
      process.env.APP_ROOT,
      "node_modules",
      "sql.js",
      "dist",
      "sql-wasm.wasm"
    );
    const wasmBuffer = fs.readFileSync(wasmPath);
    const SQL = await initSqlJs({
      wasmBinary: wasmBuffer
    });
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
      console.log("Banco de dados carregado com sucesso.");
    } else {
      db = new SQL.Database();
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
          
          -- NOVOS CAMPOS ADICIONADOS AQUI:
          diasSemana TEXT,  -- Salvará o JSON (ex: '["Seg", "Qua"]')
          horarioAula TEXT, -- Salvará o horário (ex: '19:00')

          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS classes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          turma TEXT NOT NULL,
          data_aula TEXT NOT NULL,
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
  } catch (err) {
    console.error("ERRO CRÍTICO NO BANCO:", err);
  }
}
function salvarBanco() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 1e3,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
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
ipcMain.handle("get-alunos", () => {
  try {
    if (!db) return [];
    const result = db.exec("SELECT * FROM students ORDER BY id DESC");
    if (result.length === 0) return [];
    const columns = result[0].columns;
    const values = result[0].values;
    const alunos = values.map((row) => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      let diasParsed = [];
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
        diasSemana: diasParsed,
        // Campo convertido
        horarioAula: obj.horarioAula
        // Campo simples
      };
    });
    return alunos;
  } catch (error) {
    console.error("Erro ao buscar:", error);
    return [];
  }
});
ipcMain.handle(
  "add-aluno",
  (event, dados) => {
    try {
      if (!db) return { success: false, error: "Banco não iniciado" };
      const diaVencimentoSafe = parseInt(String(dados.diaVencimento || 0));
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
      const params = {
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
        $horarioAula: dados.horarioAula || ""
      };
      stmt.run(params);
      stmt.free();
      salvarBanco();
      return { success: true };
    } catch (error) {
      let msg = "Erro desconhecido";
      if (error instanceof Error) msg = error.message;
      console.error("Erro ao inserir:", msg);
      return { success: false, error: msg };
    }
  }
);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
