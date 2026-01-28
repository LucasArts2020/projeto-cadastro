import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const initSqlJs = require("sql.js");

export type SqlValue = number | string | Uint8Array | null;

export interface QueryExecResult {
  columns: string[];
  values: SqlValue[][];
}

export interface SqlStatement {
  run(params?: Record<string, SqlValue> | SqlValue[]): void;
  free(): void;
}

export interface Database {
  run(sql: string, params?: Record<string, SqlValue> | SqlValue[]): Database;
  exec(sql: string): QueryExecResult[];
  prepare(sql: string): SqlStatement;
  export(): Uint8Array;
}

export class DatabaseManager {
  private db: Database | null = null;
  private dbPath: string;
  private wasmPath: string;

  constructor(dbPath: string, wasmPath: string) {
    this.dbPath = dbPath;
    this.wasmPath = wasmPath;
  }

  async init(): Promise<void> {
    try {
      if (!fs.existsSync(this.wasmPath)) {
        throw new Error(
          `CRÍTICO: Arquivo sql-wasm.wasm não encontrado no caminho: ${this.wasmPath}`,
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
        this.db = new SQL.Database(fileBuffer) as Database;
        console.log("Banco de dados existente carregado com sucesso.");
      } else {
        this.db = new SQL.Database() as Database;
      }

      // CORREÇÃO: Chama createTables sempre para garantir migrações e novas tabelas
      this.createTables();
    } catch (err) {
      console.error("ERRO CRÍTICO AO INICIAR BANCO:", err);
      throw err;
    }
  }

  private createTables() {
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
      attendance_reference_id INTEGER,
      data_reposicao TEXT NOT NULL,
      horario_reposicao TEXT NOT NULL,
      turma_origem TEXT,
      observacao TEXT,
      concluida INTEGER DEFAULT 0, -- Coluna nova
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id)
    );
  `);

    // ============================================================
    // MIGRAÇÃO: Adiciona a coluna em bancos existentes
    // ============================================================
    try {
      this.db.run(
        "ALTER TABLE replacements ADD COLUMN attendance_reference_id INTEGER",
      );
    } catch (e) {
      // Ignora erro se a coluna já existir
    }
    try {
      this.db.run(
        "ALTER TABLE replacements ADD COLUMN concluida INTEGER DEFAULT 0",
      );
    } catch (e) {
      // Ignora erro se a coluna já existir
    }

    this.save();
    console.log("Tabelas verificadas e banco salvo.");
  }

  public getInstance(): Database {
    if (!this.db) throw new Error("Banco de dados não inicializado.");
    return this.db;
  }

  public save(): void {
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
