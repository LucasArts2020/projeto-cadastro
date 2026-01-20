import { app, protocol, net, ipcMain, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs";
import { createRequire } from "node:module";
import crypto from "node:crypto";
const require$1 = createRequire(import.meta.url);
const initSqlJs = require$1("sql.js");
class DatabaseManager {
  db = null;
  dbPath;
  appRoot;
  constructor(appRoot) {
    this.appRoot = appRoot;
    this.dbPath = path.join(appRoot, "dados.sqlite");
  }
  async init() {
    try {
      const wasmPath = path.join(
        this.appRoot,
        "node_modules",
        "sql.js",
        "dist",
        "sql-wasm.wasm"
      );
      const wasmBuffer = fs.readFileSync(wasmPath);
      const SQL = await initSqlJs({ wasmBinary: wasmBuffer });
      if (fs.existsSync(this.dbPath)) {
        const fileBuffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(fileBuffer);
        console.log("Banco de dados carregado com sucesso.");
      } else {
        this.db = new SQL.Database();
        this.createTables();
      }
    } catch (err) {
      console.error("ERRO CRÍTICO NO BANCO:", err);
      throw err;
    }
  }
  createTables() {
    if (!this.db) return;
    this.db.run(`
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
        diasSemana TEXT,
        horarioAula TEXT,
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
    this.save();
    console.log("Novo banco de dados criado.");
  }
  getInstance() {
    if (!this.db) throw new Error("Banco de dados não inicializado.");
    return this.db;
  }
  save() {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }
}
class StudentRepository {
  dbManager;
  constructor(dbManager2) {
    this.dbManager = dbManager2;
  }
  getAll() {
    try {
      const db = this.dbManager.getInstance();
      const result = db.exec("SELECT * FROM students ORDER BY id DESC");
      if (result.length === 0) return [];
      const columns = result[0].columns;
      const values = result[0].values;
      return values.map((row) => {
        const obj = {};
        columns.forEach((col, i) => {
          obj[col] = row[i];
        });
        let diasParsed = [];
        try {
          if (obj.diasSemana) diasParsed = JSON.parse(obj.diasSemana);
        } catch (e) {
          diasParsed = [];
        }
        return {
          ...obj,
          telefone2: obj.telefoneEmergencia,
          // Mapeamento Banco -> Front
          fotoUrl: obj.foto,
          // Mapeamento Banco -> Front
          diasSemana: diasParsed,
          horarioAula: obj.horarioAula
        };
      });
    } catch (error) {
      console.error("Erro no repository getAll:", error);
      return [];
    }
  }
  create(dados) {
    try {
      const db = this.dbManager.getInstance();
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
        // Mapeamento Front -> Banco
        $endereco: dados.endereco,
        $foto: dados.fotoUrl || null,
        // Mapeamento Front -> Banco
        $turma: dados.turma,
        $valorMatricula: dados.valorMatricula,
        $planoMensal: dados.planoMensal,
        $valorMensalidade: dados.valorMensalidade,
        $formaPagamento: dados.formaPagamento,
        $diaVencimento: diaVencimentoSafe,
        $diasSemana: diasSemanaString,
        $horarioAula: dados.horarioAula || ""
      };
      stmt.run(params);
      stmt.free();
      this.dbManager.save();
      return { success: true };
    } catch (error) {
      let msg = "Erro desconhecido";
      if (error instanceof Error) msg = error.message;
      console.error("Erro no repository create:", msg);
      return { success: false, error: msg };
    }
  }
  saveImg(file) {
    const imagesDir = path.join(app.getPath("userData"), "images");
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    const ext = path.extname(file.name);
    const fileName = crypto.randomUUID() + ext;
    const filePath = path.join(imagesDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(file.buffer));
    return filePath;
  }
  // --- FUNÇÃO UPDATE CORRIGIDA ---
  update(student) {
    try {
      const db = this.dbManager.getInstance();
      const diaVencimentoSafe = parseInt(String(student.diaVencimento || 0));
      const diasSemanaString = JSON.stringify(student.diasSemana || []);
      const stmt = db.prepare(`
        UPDATE students 
        SET 
          nome = $nome,
          rg = $rg,
          cpf = $cpf,
          dataNascimento = $dataNascimento,
          telefone = $telefone,
          telefoneEmergencia = $telefoneEmergencia,
          endereco = $endereco,
          turma = $turma,
          diasSemana = $diasSemana,
          horarioAula = $horarioAula,
          valorMatricula = $valorMatricula,
          planoMensal = $planoMensal,
          valorMensalidade = $valorMensalidade,
          formaPagamento = $formaPagamento,
          diaVencimento = $diaVencimento,
          foto = $foto
        WHERE id = $id
      `);
      const params = {
        $id: student.id,
        $nome: student.nome,
        $rg: student.rg,
        $cpf: student.cpf,
        // Correção: nome da coluna é dataNascimento, não data_nascimento
        $dataNascimento: student.dataNascimento,
        $telefone: student.telefone,
        // Correção: Mapeia telefone2 -> telefoneEmergencia
        $telefoneEmergencia: student.telefone2 || "",
        $endereco: student.endereco,
        $turma: student.turma,
        // Correção: nome da coluna diasSemana e converte para string
        $diasSemana: diasSemanaString,
        $horarioAula: student.horarioAula || "",
        $valorMatricula: student.valorMatricula,
        $planoMensal: student.planoMensal,
        $valorMensalidade: student.valorMensalidade,
        $formaPagamento: student.formaPagamento,
        $diaVencimento: diaVencimentoSafe,
        // Correção: Mapeia fotoUrl -> foto
        $foto: student.fotoUrl || null
      };
      stmt.run(params);
      stmt.free();
      this.dbManager.save();
      return { success: true };
    } catch (error) {
      let msg = "Erro desconhecido ao atualizar";
      if (error instanceof Error) msg = error.message;
      console.error("Erro no repository update:", msg);
      return { success: false, error: msg };
    }
  }
  delete(id) {
    try {
      const db = this.dbManager.getInstance();
      const stmt = db.prepare("DELETE FROM students WHERE id = $id");
      stmt.run({ $id: id });
      stmt.free();
      this.dbManager.save();
      return { success: true };
    } catch (error) {
      let msg = "Erro ao deletar";
      if (error instanceof Error) msg = error.message;
      console.error("Erro no repository delete:", msg);
      return { success: false, error: msg };
    }
  }
}
class AttendanceRepository {
  dbManager;
  constructor(dbManager2) {
    this.dbManager = dbManager2;
  }
  save(data) {
    const db = this.dbManager.getInstance();
    try {
      db.exec("BEGIN TRANSACTION");
      const stmtClass = db.prepare(
        "INSERT INTO classes (turma, data_aula) VALUES ($turma, $data_aula)"
      );
      stmtClass.run({
        $turma: data.turma || "Geral",
        $data_aula: data.dataAula
      });
      const result = db.exec("SELECT last_insert_rowid() as id");
      const classId = result[0].values[0][0];
      stmtClass.free();
      const stmtAttendance = db.prepare(
        "INSERT INTO attendance (student_id, class_id, status) VALUES ($studentId, $classId, $status)"
      );
      data.registros.forEach((reg) => {
        stmtAttendance.run({
          $studentId: reg.studentId,
          $classId: classId,
          $status: reg.status
        });
      });
      stmtAttendance.free();
      db.exec("COMMIT");
      this.dbManager.save();
      return { success: true };
    } catch (error) {
      db.exec("ROLLBACK");
      console.error("Erro ao salvar chamada:", error);
      return { success: false, error: error.message };
    }
  }
  getHistory(filters) {
    const db = this.dbManager.getInstance();
    try {
      let query = `
        SELECT 
          c.id, 
          c.turma, 
          c.data_aula, 
          COUNT(a.id) as total_alunos,
          SUM(CASE WHEN a.status = 'presente' THEN 1 ELSE 0 END) as presentes
        FROM classes c
        LEFT JOIN attendance a ON c.id = a.class_id
      `;
      const conditions = [];
      if (filters?.startDate) {
        conditions.push(`c.data_aula >= '${filters.startDate}'`);
      }
      if (filters?.endDate) {
        conditions.push(`c.data_aula <= '${filters.endDate}'`);
      }
      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }
      query += `
        GROUP BY c.id
        ORDER BY c.data_aula DESC, c.id DESC
      `;
      const result = db.exec(query);
      if (result.length === 0) return [];
      const columns = result[0].columns;
      const values = result[0].values;
      return values.map((row) => {
        const obj = {};
        columns.forEach((col, i) => {
          obj[col] = row[i];
        });
        return obj;
      });
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return [];
    }
  }
  getClassDetails(classId) {
    const db = this.dbManager.getInstance();
    try {
      const result = db.exec(`
        SELECT 
          s.id, s.nome, s.foto, a.status 
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.class_id = ${classId}
        ORDER BY s.nome ASC
      `);
      if (result.length === 0) return [];
      const columns = result[0].columns;
      const values = result[0].values;
      return values.map((row) => {
        const obj = {};
        columns.forEach((col, i) => {
          obj[col] = row[i];
        });
        return {
          studentId: obj.id,
          nome: obj.nome,
          fotoUrl: obj.foto,
          status: obj.status
        };
      });
    } catch (error) {
      console.error("Erro ao buscar detalhes da aula:", error);
      return [];
    }
  }
  delete(classId) {
    const db = this.dbManager.getInstance();
    try {
      db.exec("BEGIN TRANSACTION");
      const stmtAtt = db.prepare("DELETE FROM attendance WHERE class_id = $id");
      stmtAtt.run({ $id: classId });
      stmtAtt.free();
      const stmtClass = db.prepare("DELETE FROM classes WHERE id = $id");
      stmtClass.run({ $id: classId });
      stmtClass.free();
      db.exec("COMMIT");
      this.dbManager.save();
      return { success: true };
    } catch (error) {
      db.exec("ROLLBACK");
      console.error("Erro ao deletar aula:", error);
      return { success: false, error: error.message };
    }
  }
}
protocol.registerSchemesAsPrivileged([
  {
    scheme: "media",
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      bypassCSP: true
    }
  }
]);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
const dbManager = new DatabaseManager(process.env.APP_ROOT);
const studentRepo = new StudentRepository(dbManager);
const attendanceRepo = new AttendanceRepository(dbManager);
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
  protocol.handle("media", (request) => {
    try {
      const url = new URL(request.url);
      let filePath = decodeURIComponent(url.hostname + url.pathname);
      if (filePath.startsWith("/")) {
        filePath = filePath.slice(1);
      }
      if (filePath.match(/^[a-zA-Z]\//)) {
        filePath = filePath[0] + ":" + filePath.slice(1);
      }
      const finalizedPath = path.normalize(filePath);
      console.log("Caminho Processado:", finalizedPath);
      if (!fs.existsSync(finalizedPath)) {
        console.error(`[ERRO CRÍTICO] Arquivo não existe: ${finalizedPath}`);
        return new Response("Arquivo não encontrado", { status: 404 });
      }
      return net.fetch(pathToFileURL(finalizedPath).toString());
    } catch (error) {
      console.error("Erro no protocolo media:", error);
      return new Response("Erro", { status: 500 });
    }
  });
  await dbManager.init();
  createWindow();
});
ipcMain.handle("get-alunos", () => {
  return studentRepo.getAll();
});
ipcMain.handle("add-aluno", (event, dados) => {
  return studentRepo.create(dados);
});
ipcMain.handle("save-attendance", (event, data) => {
  return attendanceRepo.save(data);
});
ipcMain.handle("get-class-details", (event, classId) => {
  return attendanceRepo.getClassDetails(classId);
});
ipcMain.handle("get-attendance-history", (event, filters) => {
  return attendanceRepo.getHistory(filters);
});
ipcMain.handle("save-image", (_, file) => {
  return studentRepo.saveImg(file);
});
ipcMain.handle("update-aluno", (event, dados) => {
  return studentRepo.update(dados);
});
ipcMain.handle("delete-aluno", async (_, id) => {
  return studentRepo.delete(id);
});
ipcMain.handle("delete-class", (_, id) => {
  return attendanceRepo.delete(id);
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
