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

      // 1. Pegar limites (Mantém igual)
      const limitsResult = db.exec("SELECT horario, limite FROM class_config");
      const limits: Record<string, number> = {};
      if (limitsResult.length) {
        limitsResult[0].values.forEach((row) => {
          limits[row[0] as string] = row[1] as number;
        });
      }

      // 2. PEGANDO ALUNOS FIXOS (LÓGICA NOVA)
      // Agora buscamos TODOS os alunos que têm o dia na semana, e processamos o JSON no JS
      // O filtro SQL busca quem tem a sigla (ex: "Seg") na string JSON
      const fixedStudentsResult = db.exec(`
        SELECT diasSemana 
        FROM students 
        WHERE diasSemana LIKE '%"${dayOfWeekSigla}"%' 
      `);

      const fixedCounts: Record<string, number> = {};

      if (fixedStudentsResult.length) {
        const rows = fixedStudentsResult[0].values;

        rows.forEach((row) => {
          const diasJsonString = row[0] as string;
          try {
            const diasArray = JSON.parse(diasJsonString);

            // Verifica se é o formato novo (Objeto) ou antigo (String)
            // Se for array de objetos, acha o horário daquele dia específico
            if (
              Array.isArray(diasArray) &&
              diasArray.length > 0 &&
              typeof diasArray[0] === "object"
            ) {
              const diaConfig = diasArray.find(
                (d: any) => d.dia === dayOfWeekSigla,
              );
              if (diaConfig && diaConfig.horario) {
                const h = diaConfig.horario;
                fixedCounts[h] = (fixedCounts[h] || 0) + 1;
              }
            }
            // Fallback para o sistema antigo (caso tenha dados velhos no banco)
            else {
              // Se for string antiga, não temos como saber o horário exato sem olhar a coluna horarioAula
              // Mas idealmente você deve migrar os dados ou ignorar aqui.
            }
          } catch (e) {
            console.error("Erro parse diasSemana", e);
          }
        });
      }

      // 3. Pegar reposições (Mantém igual)
      const replacementsResult = db.exec(`
        SELECT horario_reposicao, count(*) as total
        FROM replacements
        WHERE data_reposicao = '${date}'
        AND (concluida IS NULL OR concluida = 0)
        GROUP BY horario_reposicao
      `);

      const replacementCounts: Record<string, number> = {};
      if (replacementsResult.length) {
        replacementsResult[0].values.forEach((row) => {
          replacementCounts[row[0] as string] = row[1] as number;
        });
      }

      // 4. Montar Lista Final (Mantém igual)
      let allHours = Object.keys(limits).sort();
      if (allHours.length === 0) {
        // ... sua lista padrão ...
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
