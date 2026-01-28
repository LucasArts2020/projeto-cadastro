import { DatabaseManager } from "../database/DatabaseManager";

interface AttendanceRecord {
  studentId: number;
  status: "presente" | "falta" | "justificado";
}

interface SaveAttendanceDTO {
  turma: string;
  dataAula: string;
  registros: AttendanceRecord[];
}

export class AttendanceRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }
  save(data: SaveAttendanceDTO) {
    const db = this.dbManager.getInstance();

    try {
      db.exec("BEGIN TRANSACTION");

      // 1. Criar ou Vincular Aula
      const stmtClass = db.prepare(
        "INSERT INTO classes (turma, data_aula) VALUES ($turma, $data_aula)",
      );

      stmtClass.run({
        $turma: data.turma || "Geral",
        $data_aula: data.dataAula,
      });

      const result = db.exec("SELECT last_insert_rowid() as id");
      const classId = result[0].values[0][0];
      stmtClass.free();

      // 2. Salvar Presenças
      const stmtAttendance = db.prepare(
        "INSERT INTO attendance (student_id, class_id, status) VALUES ($studentId, $classId, $status)",
      );

      const presentesIds: number[] = [];

      data.registros.forEach((reg) => {
        stmtAttendance.run({
          $studentId: reg.studentId,
          $classId: classId,
          $status: reg.status,
        });

        // Se o aluno estava presente, guardamos o ID dele
        if (reg.status === "presente") {
          presentesIds.push(reg.studentId);
        }
      });

      stmtAttendance.free();

      // 3. ATUALIZAÇÃO AUTOMÁTICA DE REPOSIÇÃO [LÓGICA NOVA]
      if (presentesIds.length > 0) {
        const idsString = presentesIds.join(",");
        // Marca como concluída (1) se a data bater e o aluno estiver na lista de presentes
        db.run(`
          UPDATE replacements 
          SET concluida = 1 
          WHERE data_reposicao = '${data.dataAula}' 
          AND student_id IN (${idsString})
        `);
      }

      db.exec("COMMIT");
      this.dbManager.save();

      return { success: true };
    } catch (error: any) {
      db.exec("ROLLBACK");
      console.error("Erro ao salvar chamada:", error);
      return { success: false, error: error.message };
    }
  }
  getHistory(filters?: { startDate?: string; endDate?: string }) {
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

      const conditions: string[] = [];

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
        const obj: any = {};
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
  getClassDetails(classId: number) {
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

      return values.map((row: any) => {
        const obj: any = {};
        columns.forEach((col: string, i: number) => {
          obj[col] = row[i];
        });

        return {
          studentId: obj.id,
          nome: obj.nome,
          fotoUrl: obj.foto,
          status: obj.status,
        };
      });
    } catch (error) {
      console.error("Erro ao buscar detalhes da aula:", error);
      return [];
    }
  }
  delete(classId: number) {
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
    } catch (error: any) {
      db.exec("ROLLBACK");
      console.error("Erro ao deletar aula:", error);
      return { success: false, error: error.message };
    }
  }
}
