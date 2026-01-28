var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { app, protocol, Menu, net, ipcMain, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs";
import { createRequire } from "node:module";
import crypto from "node:crypto";
const require$1 = createRequire(import.meta.url);
const initSqlJs = require$1("sql.js");
class DatabaseManager {
  constructor(dbPath, wasmPath) {
    __publicField(this, "db", null);
    __publicField(this, "dbPath");
    __publicField(this, "wasmPath");
    this.dbPath = dbPath;
    this.wasmPath = wasmPath;
  }
  async init() {
    try {
      if (!fs.existsSync(this.wasmPath)) {
        throw new Error(
          `CRÍTICO: Arquivo sql-wasm.wasm não encontrado no caminho: ${this.wasmPath}`
        );
      }
      console.log("Salvando DB em:", this.dbPath);
      const wasmBuffer = fs.readFileSync(this.wasmPath);
      const SQL = await initSqlJs({ wasmBinary: wasmBuffer });
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        console.log(`Criando diretório para o banco: ${dbDir}`);
        fs.mkdirSync(dbDir, { recursive: true });
      }
      if (fs.existsSync(this.dbPath)) {
        const fileBuffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(fileBuffer);
        console.log("Banco de dados existente carregado com sucesso.");
      } else {
        this.db = new SQL.Database();
      }
      this.createTables();
    } catch (err) {
      console.error("ERRO CRÍTICO AO INICIAR BANCO:", err);
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

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      mesReferencia TEXT NOT NULL,
      valor REAL NOT NULL,
      dataPagamento TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id),
      UNIQUE(student_id, mesReferencia)
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

    CREATE TABLE IF NOT EXISTS class_config (
      horario TEXT PRIMARY KEY,
      limite INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS replacements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      attendance_reference_id INTEGER, -- Adicionado para novos bancos
      data_reposicao TEXT NOT NULL, -- Formato YYYY-MM-DD
      horario_reposicao TEXT NOT NULL,
      turma_origem TEXT, -- Apenas para registro
      observacao TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id)
    );
  `);
    try {
      this.db.run(
        "ALTER TABLE replacements ADD COLUMN attendance_reference_id INTEGER"
      );
    } catch (e) {
    }
    this.save();
    console.log("Tabelas verificadas e banco salvo.");
  }
  getInstance() {
    if (!this.db) throw new Error("Banco de dados não inicializado.");
    return this.db;
  }
  save() {
    if (!this.db) return;
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    } catch (error) {
      console.error("Erro ao salvar o arquivo do banco:", error);
    }
  }
}
class StudentRepository {
  constructor(dbManager2) {
    this.dbManager = dbManager2;
  }
  getAll() {
    try {
      const db = this.dbManager.getInstance();
      const mesAtual = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
      const result = db.exec(`
        SELECT 
          s.*,
          CASE 
            WHEN p.id IS NOT NULL THEN 1
            ELSE 0
          END AS pago,
          p.dataPagamento
        FROM students s
        LEFT JOIN payments p
          ON p.student_id = s.id
         AND p.mesReferencia = '${mesAtual}'
        ORDER BY s.id DESC
      `);
      if (!result.length) return [];
      const { columns, values } = result[0];
      return values.map((row) => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        let diasParsed = [];
        try {
          if (obj.diasSemana) diasParsed = JSON.parse(obj.diasSemana);
        } catch {
          diasParsed = [];
        }
        return {
          ...obj,
          telefone2: obj.telefoneEmergencia,
          fotoUrl: obj.foto,
          diasSemana: diasParsed
        };
      });
    } catch (error) {
      console.error("Erro no getAll:", error);
      return [];
    }
  }
  // ===============================
  // CRIAR ALUNO
  // ===============================
  create(dados) {
    try {
      const db = this.dbManager.getInstance();
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
      stmt.run({
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
        $diaVencimento: Number(dados.diaVencimento),
        $diasSemana: JSON.stringify(dados.diasSemana || []),
        $horarioAula: dados.horarioAula || ""
      });
      stmt.free();
      this.dbManager.save();
      return { success: true };
    } catch (error) {
      console.error("Erro ao criar aluno:", error);
      return { success: false, error: error.message };
    }
  }
  // ===============================
  // CONFIRMAR PAGAMENTO (MÊS ATUAL)
  // ===============================
  confirmarPagamento(studentId) {
    try {
      const db = this.dbManager.getInstance();
      const mesReferencia = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
      const dataPagamento = (/* @__PURE__ */ new Date()).toISOString();
      db.run(
        `
        INSERT OR REPLACE INTO payments
          (student_id, mesReferencia, valor, dataPagamento)
        SELECT
          id,
          ?,
          valorMensalidade,
          ?
        FROM students
        WHERE id = ?
      `,
        [mesReferencia, dataPagamento, studentId]
      );
      this.dbManager.save();
      return { success: true };
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
      return { success: false, error: error.message };
    }
  }
  // ===============================
  // ATUALIZAR ALUNO
  // ===============================
  update(student) {
    try {
      const db = this.dbManager.getInstance();
      const stmt = db.prepare(`
        UPDATE students SET
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
      stmt.run({
        $id: student.id,
        $nome: student.nome,
        $rg: student.rg,
        $cpf: student.cpf,
        $dataNascimento: student.dataNascimento,
        $telefone: student.telefone,
        $telefoneEmergencia: student.telefone2 || "",
        $endereco: student.endereco,
        $turma: student.turma,
        $diasSemana: JSON.stringify(student.diasSemana || []),
        $horarioAula: student.horarioAula || "",
        $valorMatricula: student.valorMatricula,
        $planoMensal: student.planoMensal,
        $valorMensalidade: student.valorMensalidade,
        $formaPagamento: student.formaPagamento,
        $diaVencimento: Number(student.diaVencimento),
        $foto: student.fotoUrl || null
      });
      stmt.free();
      this.dbManager.save();
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      return { success: false, error: error.message };
    }
  }
  // ===============================
  // DELETAR ALUNO + PAGAMENTOS
  // ===============================
  delete(id) {
    try {
      const db = this.dbManager.getInstance();
      db.run(`DELETE FROM payments WHERE student_id = ?`, [id]);
      db.run(`DELETE FROM students WHERE id = ?`, [id]);
      this.dbManager.save();
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar:", error);
      return { success: false, error: error.message };
    }
  }
  // ===============================
  // SALVAR IMAGEM
  // ===============================
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
}
class AttendanceRepository {
  constructor(dbManager2) {
    __publicField(this, "dbManager");
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
      if (filters == null ? void 0 : filters.startDate) {
        conditions.push(`c.data_aula >= '${filters.startDate}'`);
      }
      if (filters == null ? void 0 : filters.endDate) {
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
class ConfigRepository {
  constructor(dbManager2) {
    this.dbManager = dbManager2;
  }
  getLimits() {
    try {
      const db = this.dbManager.getInstance();
      const result = db.exec("SELECT horario, limite FROM class_config");
      const limits = {};
      if (result.length > 0) {
        result[0].values.forEach((row) => {
          const horario = row[0];
          const limite = row[1];
          limits[horario] = limite;
        });
      }
      return limits;
    } catch (error) {
      console.error("Erro ao buscar limites:", error);
      return {};
    }
  }
  saveLimit(horario, limite) {
    try {
      const db = this.dbManager.getInstance();
      db.run(
        `INSERT OR REPLACE INTO class_config (horario, limite) VALUES (?, ?)`,
        [horario, limite]
      );
      this.dbManager.save();
    } catch (error) {
      console.error("Erro ao salvar limite:", error);
      throw error;
    }
  }
}
class ReposicaoRepository {
  constructor(dbManager2) {
    this.dbManager = dbManager2;
  }
  // Busca alunos com faltas recentes para sugerir reposição
  getAbsences() {
    try {
      const db = this.dbManager.getInstance();
      const result = db.exec(`
        SELECT 
          a.id as attendance_id,
          c.data_aula,
          s.id as student_id,
          s.nome,
          s.turma,
          r.id as replacement_id,           
          r.data_reposicao as data_agendada 
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN classes c ON a.class_id = c.id
        LEFT JOIN replacements r ON r.attendance_reference_id = a.id 
        WHERE a.status = 'falta'
        ORDER BY c.data_aula DESC
        LIMIT 50
      `);
      if (!result.length) return [];
      const { columns, values } = result[0];
      return values.map((row) => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        return obj;
      });
    } catch (error) {
      console.error("Erro ao buscar faltas:", error);
      return [];
    }
  }
  // Verifica disponibilidade para uma data específica
  getAvailability(date, dayOfWeekSigla) {
    try {
      const db = this.dbManager.getInstance();
      const limitsResult = db.exec("SELECT horario, limite FROM class_config");
      const limits = {};
      if (limitsResult.length) {
        limitsResult[0].values.forEach((row) => {
          limits[row[0]] = row[1];
        });
      }
      const fixedStudentsResult = db.exec(`
        SELECT horarioAula, count(*) as total 
        FROM students 
        WHERE diasSemana LIKE '%"${dayOfWeekSigla}"%' 
        GROUP BY horarioAula
      `);
      const fixedCounts = {};
      if (fixedStudentsResult.length) {
        fixedStudentsResult[0].values.forEach((row) => {
          fixedCounts[row[0]] = row[1];
        });
      }
      const replacementsResult = db.exec(`
        SELECT horario_reposicao, count(*) as total
        FROM replacements
        WHERE data_reposicao = '${date}'
        GROUP BY horario_reposicao
      `);
      const replacementCounts = {};
      if (replacementsResult.length) {
        replacementsResult[0].values.forEach((row) => {
          replacementCounts[row[0]] = row[1];
        });
      }
      const defaultHours = [
        "06:00",
        "07:00",
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00"
      ];
      const dbHours = Object.keys(limits);
      const allHours = Array.from(
        /* @__PURE__ */ new Set([...defaultHours, ...dbHours])
      ).sort();
      const availability = [];
      allHours.forEach((horario) => {
        const limite = limits[horario] || 6;
        const fixos = fixedCounts[horario] || 0;
        const extras = replacementCounts[horario] || 0;
        const ocupacao = fixos + extras;
        availability.push({
          horario,
          limite,
          ocupados: ocupacao,
          vagas: Math.max(0, limite - ocupacao),
          status: ocupacao >= limite ? "lotado" : "disponivel"
        });
      });
      return availability;
    } catch (error) {
      console.error("Erro ao calcular disponibilidade:", error);
      return [];
    }
  }
  getReplacementsForDate(date) {
    try {
      const db = this.dbManager.getInstance();
      const result = db.exec(`
        SELECT 
          s.*, 
          r.horario_reposicao,
          r.id as reposicao_id
        FROM replacements r
        JOIN students s ON r.student_id = s.id
        WHERE r.data_reposicao = '${date}'
      `);
      if (!result.length) return [];
      const { columns, values } = result[0];
      return values.map((row) => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        return {
          ...obj,
          horarioAula: obj.horario_reposicao,
          // Sobrescreve o horário fixo pelo da reposição
          telefone2: obj.telefoneEmergencia,
          fotoUrl: obj.foto,
          isReposicao: true
          // Flag para identificar no front
        };
      });
    } catch (error) {
      console.error("Erro ao buscar reposições:", error);
      return [];
    }
  }
  schedule(data) {
    try {
      const db = this.dbManager.getInstance();
      db.run(
        `
        INSERT INTO replacements (student_id, attendance_reference_id, data_reposicao, horario_reposicao, observacao)
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          data.student_id,
          data.attendance_id,
          data.data_reposicao,
          data.horario,
          data.obs || ""
        ]
      );
      this.dbManager.save();
      return { success: true };
    } catch (error) {
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
Menu.setApplicationMenu(null);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
const dbSavePath = path.join(app.getPath("userData"), "dados.sqlite");
const wasmSourcePath = path.join(process.env.VITE_PUBLIC, "sql-wasm.wasm");
const dbManager = new DatabaseManager(dbSavePath, wasmSourcePath);
const studentRepo = new StudentRepository(dbManager);
const attendanceRepo = new AttendanceRepository(dbManager);
const configRepo = new ConfigRepository(dbManager);
const reposicaoRepo = new ReposicaoRepository(dbManager);
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
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
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
      if (!fs.existsSync(finalizedPath)) {
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
ipcMain.handle("add-aluno", (_, dados) => {
  return studentRepo.create(dados);
});
ipcMain.handle("save-attendance", (_, data) => {
  return attendanceRepo.save(data);
});
ipcMain.handle("get-class-details", (_, classId) => {
  return attendanceRepo.getClassDetails(classId);
});
ipcMain.handle("get-attendance-history", (_, filters) => {
  return attendanceRepo.getHistory(filters);
});
ipcMain.handle("save-image", (_, file) => {
  return studentRepo.saveImg(file);
});
ipcMain.handle("update-aluno", (_, dados) => {
  return studentRepo.update(dados);
});
ipcMain.handle("delete-aluno", async (_, id) => {
  return studentRepo.delete(id);
});
ipcMain.handle("delete-class", (_, id) => {
  return attendanceRepo.delete(id);
});
ipcMain.handle("confirmar-pagamento", (_, id) => {
  return studentRepo.confirmarPagamento(id);
});
ipcMain.handle("get-limits", () => {
  return configRepo.getLimits();
});
ipcMain.handle("save-limit", (_, { horario, limite }) => {
  return configRepo.saveLimit(horario, limite);
});
ipcMain.handle("get-absences", () => reposicaoRepo.getAbsences());
ipcMain.handle(
  "check-availability",
  (_, { date, dayOfWeek }) => reposicaoRepo.getAvailability(date, dayOfWeek)
);
ipcMain.handle(
  "schedule-replacement",
  (_, data) => reposicaoRepo.schedule(data)
);
ipcMain.handle(
  "get-replacements-date",
  (_, date) => reposicaoRepo.getReplacementsForDate(date)
);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
