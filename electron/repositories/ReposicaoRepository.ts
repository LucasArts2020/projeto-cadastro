import { DatabaseManager } from "../database/DatabaseManager";

export class ReposicaoRepository {
  constructor(private dbManager: DatabaseManager) {}

  // Busca alunos com faltas e verifica se já agendaram reposição
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
        const obj: any = {};
        columns.forEach((col, i) => (obj[col] = row[i]));
        return obj;
      });
    } catch (error) {
      console.error("Erro ao buscar faltas:", error);
      return [];
    }
  }

  getReplacementsForDate(date: string) {
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
        AND (r.concluida IS NULL OR r.concluida = 0) -- FILTRO NOVO
      `);

      if (!result.length) return [];

      const { columns, values } = result[0];
      return values.map((row) => {
        const obj: any = {};
        columns.forEach((col, i) => (obj[col] = row[i]));
        return {
          ...obj,
          horarioAula: obj.horario_reposicao,
          telefone2: obj.telefoneEmergencia,
          fotoUrl: obj.foto,
          isReposicao: true,
        };
      });
    } catch (error) {
      console.error("Erro ao buscar reposições:", error);
      return [];
    }
  }

  getAvailability(date: string, dayOfWeekSigla: string) {
    try {
      const db = this.dbManager.getInstance();

      // 1. Pegar limites configurados
      const limitsResult = db.exec("SELECT horario, limite FROM class_config");
      const limits: Record<string, number> = {};
      if (limitsResult.length) {
        limitsResult[0].values.forEach((row) => {
          limits[row[0] as string] = row[1] as number;
        });
      }

      // 2. Pegar alunos fixos
      const fixedStudentsResult = db.exec(`
        SELECT horarioAula, count(*) as total 
        FROM students 
        WHERE diasSemana LIKE '%"${dayOfWeekSigla}"%' 
        GROUP BY horarioAula
      `);

      const fixedCounts: Record<string, number> = {};
      if (fixedStudentsResult.length) {
        fixedStudentsResult[0].values.forEach((row) => {
          fixedCounts[row[0] as string] = row[1] as number;
        });
      }

      // 3. Pegar reposições
      const replacementsResult = db.exec(`
        SELECT horario_reposicao, count(*) as total
        FROM replacements
        WHERE data_reposicao = '${date}'
        GROUP BY horario_reposicao
      `);

      const replacementCounts: Record<string, number> = {};
      if (replacementsResult.length) {
        replacementsResult[0].values.forEach((row) => {
          replacementCounts[row[0] as string] = row[1] as number;
        });
      }

      // ==========================================================
      // LÓGICA DE HORÁRIOS: Se banco vazio, usa SUA LISTA PADRÃO
      // ==========================================================
      let allHours = Object.keys(limits).sort();

      if (allHours.length === 0) {
        // LISTA EXATA QUE VOCÊ PEDIU:
        allHours = [
          "06:00",
          "07:00",
          "08:00",
          "09:00",
          "10:00",
          "12:00",
          "15:00",
          "16:00",
          "17:00",
          "18:00",
          "19:00",
          "19:30",
          "20:00",
          "21:00",
        ];
      }

      const availability: any[] = [];

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
          status: ocupacao >= limite ? "lotado" : "disponivel",
        });
      });

      return availability;
    } catch (error) {
      console.error("Erro ao calcular disponibilidade:", error);
      return [];
    }
  }

  schedule(data: {
    student_id: number;
    attendance_id: number;
    data_reposicao: string;
    horario: string;
    obs?: string;
  }) {
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
          data.obs || "",
        ],
      );

      this.dbManager.save();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
