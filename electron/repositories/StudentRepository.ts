import { DatabaseManager, SqlValue } from "../database/DatabaseManager";
import path from "node:path";
import fs from "node:fs";
import { app } from "electron";
import crypto from "node:crypto";

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

  // ⚠️ calculado via JOIN (não existe no banco)
  pago?: number; // 0 ou 1
  dataPagamento?: string | null;
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export class StudentRepository {
  constructor(private dbManager: DatabaseManager) {}

  // ===============================
  // LISTAR ALUNOS + STATUS DE PAGAMENTO (MÊS ATUAL)
  // ===============================
  getAll(): Student[] {
    try {
      const db = this.dbManager.getInstance();
      const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM

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
        const obj: any = {};
        columns.forEach((col, i) => (obj[col] = row[i]));

        let diasParsed: string[] = [];
        try {
          if (obj.diasSemana) diasParsed = JSON.parse(obj.diasSemana);
        } catch {
          diasParsed = [];
        }

        return {
          ...obj,
          telefone2: obj.telefoneEmergencia,
          fotoUrl: obj.foto,
          diasSemana: diasParsed,
        } as Student;
      });
    } catch (error) {
      console.error("Erro no getAll:", error);
      return [];
    }
  }

  // ===============================
  // CRIAR ALUNO
  // ===============================
  create(dados: Student): ApiResponse {
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
        $horarioAula: dados.horarioAula || "",
      });

      stmt.free();
      this.dbManager.save();

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao criar aluno:", error);
      return { success: false, error: error.message };
    }
  }

  // ===============================
  // CONFIRMAR PAGAMENTO (MÊS ATUAL)
  // ===============================
  confirmarPagamento(studentId: number): ApiResponse {
    try {
      const db = this.dbManager.getInstance();
      const mesReferencia = new Date().toISOString().slice(0, 7);
      const dataPagamento = new Date().toISOString();

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
        [mesReferencia, dataPagamento, studentId],
      );

      this.dbManager.save();
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao confirmar pagamento:", error);
      return { success: false, error: error.message };
    }
  }

  // ===============================
  // ATUALIZAR ALUNO
  // ===============================
  update(student: Student): ApiResponse {
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
        $id: student.id!,
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
        $foto: student.fotoUrl || null,
      });

      stmt.free();
      this.dbManager.save();

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao atualizar:", error);
      return { success: false, error: error.message };
    }
  }

  // ===============================
  // DELETAR ALUNO + PAGAMENTOS
  // ===============================
  delete(id: number): ApiResponse {
    try {
      const db = this.dbManager.getInstance();
      db.run(`DELETE FROM payments WHERE student_id = ?`, [id]);
      db.run(`DELETE FROM students WHERE id = ?`, [id]);
      this.dbManager.save();
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao deletar:", error);
      return { success: false, error: error.message };
    }
  }

  // ===============================
  // SALVAR IMAGEM
  // ===============================
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
