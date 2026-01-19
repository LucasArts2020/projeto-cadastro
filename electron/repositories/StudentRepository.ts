import { DatabaseManager, SqlValue } from "../database/DatabaseManager";
import path from "node:path";
import fs from "node:fs";
import { app } from "electron";
import crypto from "node:crypto";

// Interface igual ao Front-End
export interface Student {
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
  diasSemana?: string[];
  horarioAula?: string;
  createdAt?: string;
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export class StudentRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  getAll(): Student[] {
    try {
      const db = this.dbManager.getInstance();
      const result = db.exec("SELECT * FROM students ORDER BY id DESC");

      if (result.length === 0) return [];

      const columns = result[0].columns;
      const values = result[0].values;

      return values.map((row) => {
        const obj: any = {};
        columns.forEach((col, i) => {
          obj[col] = row[i];
        });

        // CONVERSÃO: JSON String -> Array
        let diasParsed: string[] = [];
        try {
          if (obj.diasSemana) diasParsed = JSON.parse(obj.diasSemana);
        } catch (e) {
          diasParsed = [];
        }

        return {
          ...obj,
          telefone2: obj.telefoneEmergencia, // Mapeamento Banco -> Front
          fotoUrl: obj.foto, // Mapeamento Banco -> Front
          diasSemana: diasParsed,
          horarioAula: obj.horarioAula,
        } as Student;
      });
    } catch (error) {
      console.error("Erro no repository getAll:", error);
      return [];
    }
  }

  create(dados: Student): ApiResponse {
    try {
      const db = this.dbManager.getInstance();

      const diaVencimentoSafe = parseInt(String(dados.diaVencimento || 0));

      // CONVERSÃO: Array -> JSON String
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
        $telefoneEmergencia: dados.telefone2 || "", // Mapeamento Front -> Banco
        $endereco: dados.endereco,
        $foto: dados.fotoUrl || null, // Mapeamento Front -> Banco
        $turma: dados.turma,
        $valorMatricula: dados.valorMatricula,
        $planoMensal: dados.planoMensal,
        $valorMensalidade: dados.valorMensalidade,
        $formaPagamento: dados.formaPagamento,
        $diaVencimento: diaVencimentoSafe,
        $diasSemana: diasSemanaString,
        $horarioAula: dados.horarioAula || "",
      };

      stmt.run(params);
      stmt.free();

      // Salva no disco
      this.dbManager.save();

      return { success: true };
    } catch (error: unknown) {
      let msg = "Erro desconhecido";
      if (error instanceof Error) msg = error.message;
      console.error("Erro no repository create:", msg);
      return { success: false, error: msg };
    }
  }

  saveImg(file: { name: string; buffer: ArrayBuffer }): string {
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
