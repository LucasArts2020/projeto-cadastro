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
  private dbPath: string; // Caminho completo para SALVAR o arquivo .sqlite
  private wasmPath: string; // Caminho completo para LER o arquivo .wasm

  // O construtor agora pede os caminhos exatos, sem "adivinhar"
  constructor(dbPath: string, wasmPath: string) {
    this.dbPath = dbPath;
    this.wasmPath = wasmPath;
  }

  async init(): Promise<void> {
    try {
      console.log("--- INICIANDO BANCO DE DADOS ---");
      console.log("Lendo WASM em:", this.wasmPath);
      console.log("Salvando DB em:", this.dbPath);

      // 1. Verifica se o arquivo WASM existe (Essencial para produção)
      if (!fs.existsSync(this.wasmPath)) {
        throw new Error(
          `CRÍTICO: Arquivo sql-wasm.wasm não encontrado no caminho: ${this.wasmPath}`,
        );
      }

      // 2. Carrega o SQL.js
      const wasmBuffer = fs.readFileSync(this.wasmPath);
      const SQL = await initSqlJs({ wasmBinary: wasmBuffer });

      // 3. Garante que a pasta do banco de dados existe (Cria se não existir)
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        console.log(`Criando diretório para o banco: ${dbDir}`);
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // 4. Carrega ou Cria o Banco
      if (fs.existsSync(this.dbPath)) {
        const fileBuffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(fileBuffer) as Database;
        console.log("Banco de dados existente carregado com sucesso.");
      } else {
        this.db = new SQL.Database() as Database;
        this.createTables(); // Cria as tabelas e salva o arquivo inicial
      }
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
    console.log("Tabelas criadas e banco salvo.");
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
