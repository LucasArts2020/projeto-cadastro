import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const initSqlJs = require("sql.js");

// Tipagens do SQL.js
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
  private appRoot: string;

  constructor(appRoot: string) {
    this.appRoot = appRoot;
    this.dbPath = path.join(appRoot, "dados.sqlite");
  }

  async init(): Promise<void> {
    try {
      const wasmPath = path.join(
        this.appRoot,
        "node_modules",
        "sql.js",
        "dist",
        "sql-wasm.wasm",
      );
      const wasmBuffer = fs.readFileSync(wasmPath);

      const SQL = await initSqlJs({ wasmBinary: wasmBuffer });

      if (fs.existsSync(this.dbPath)) {
        const fileBuffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(fileBuffer) as Database;
        console.log("Banco de dados carregado com sucesso.");
      } else {
        this.db = new SQL.Database() as Database;
        this.createTables();
      }
    } catch (err) {
      console.error("ERRO CRÍTICO NO BANCO:", err);
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

  public getInstance(): Database {
    if (!this.db) throw new Error("Banco de dados não inicializado.");
    return this.db;
  }

  public save(): void {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }
}
