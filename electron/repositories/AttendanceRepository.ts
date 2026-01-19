// electron/repositories/AttendanceRepository.ts
import { DatabaseManager } from "../database/DatabaseManager";

interface AttendanceRecord {
  studentId: number;
  status: "presente" | "falta" | "justificado";
}

interface SaveAttendanceDTO {
  turma: string;
  dataAula: string; // YYYY-MM-DD
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

      const stmtClass = db.prepare(
        "INSERT INTO classes (turma, data_aula) VALUES ($turma, $data_aula)",
      );

      stmtClass.run({
        $turma: data.turma || "Geral",
        $data_aula: data.dataAula,
      });

      // Pegar o ID da aula que acabou de ser criada
      const result = db.exec("SELECT last_insert_rowid() as id");
      const classId = result[0].values[0][0];
      stmtClass.free();

      // 2. Salvar as Presenças
      const stmtAttendance = db.prepare(
        "INSERT INTO attendance (student_id, class_id, status) VALUES ($studentId, $classId, $status)",
      );

      data.registros.forEach((reg) => {
        stmtAttendance.run({
          $studentId: reg.studentId,
          $classId: classId,
          $status: reg.status,
        });
      });

      stmtAttendance.free();
      db.exec("COMMIT");

      this.dbManager.save(); // Salva no arquivo físico

      return { success: true };
    } catch (error: any) {
      db.exec("ROLLBACK"); // Se der erro, desfaz tudo
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

      // 2. Lógica de Filtros (Inserção manual na string)
      const conditions: string[] = [];

      if (filters?.startDate) {
        // Importante: Aspas simples em volta da data '${...}'
        conditions.push(`c.data_aula >= '${filters.startDate}'`);
      }

      if (filters?.endDate) {
        conditions.push(`c.data_aula <= '${filters.endDate}'`);
      }

      // Se houver condições, adiciona o WHERE
      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      // 3. Finaliza a Query com Agrupamento e Ordenação
      query += `
        GROUP BY c.id
        ORDER BY c.data_aula DESC, c.id DESC
      `;

      // 4. Execução (Usando exec em vez de prepare/all)
      const result = db.exec(query);

      if (result.length === 0) return [];

      const columns = result[0].columns;
      const values = result[0].values;

      // 5. Mapeamento dos dados
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
      // Versão limpa e compatível: Usa apenas db.exec
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
}
