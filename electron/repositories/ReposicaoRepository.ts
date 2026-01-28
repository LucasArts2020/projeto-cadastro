import { DatabaseManager } from "../database/DatabaseManager";

export class ReposicaoRepository {
  constructor(private dbManager: DatabaseManager) {}

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
        const obj: any = {};
        columns.forEach((col, i) => (obj[col] = row[i]));
        return obj;
      });
    } catch (error) {
      console.error("Erro ao buscar faltas:", error);
      return [];
    }
  }

  // Verifica disponibilidade para uma data específica
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

      // 2. Pegar alunos fixos desse dia da semana
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

      // 3. Pegar reposições já agendadas para essa data
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
      // CORREÇÃO: Lista de horários padrão para garantir exibição
      // ==========================================================
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
        "21:00",
      ];

      // Combina horários padrão com os do banco (remove duplicatas)
      const dbHours = Object.keys(limits);
      const allHours = Array.from(
        new Set([...defaultHours, ...dbHours]),
      ).sort();

      const availability: any[] = [];

      allHours.forEach((horario) => {
        const limite = limits[horario] || 6; // Limite padrão de 6 alunos
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
      `);

      if (!result.length) return [];

      const { columns, values } = result[0];
      return values.map((row) => {
        const obj: any = {};
        columns.forEach((col, i) => (obj[col] = row[i]));

        // Ajustes para bater com a interface Cadastro
        return {
          ...obj,
          horarioAula: obj.horario_reposicao, // Sobrescreve o horário fixo pelo da reposição
          telefone2: obj.telefoneEmergencia,
          fotoUrl: obj.foto,
          isReposicao: true, // Flag para identificar no front
        };
      });
    } catch (error) {
      console.error("Erro ao buscar reposições:", error);
      return [];
    }
  }

  schedule(data: {
    student_id: number;
    attendance_id: number; // NOVO CAMPO
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
