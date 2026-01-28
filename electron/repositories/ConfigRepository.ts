import { DatabaseManager } from "../database/DatabaseManager";

export class ConfigRepository {
  constructor(private dbManager: DatabaseManager) {}

  getLimits(): Record<string, number> {
    try {
      const db = this.dbManager.getInstance();
      const result = db.exec("SELECT horario, limite FROM class_config");

      const limits: Record<string, number> = {};
      if (result.length > 0) {
        result[0].values.forEach((row) => {
          const horario = row[0] as string;
          const limite = row[1] as number;
          limits[horario] = limite;
        });
      }
      return limits;
    } catch (error) {
      console.error("Erro ao buscar limites:", error);
      return {};
    }
  }

  saveLimit(horario: string, limite: number): void {
    try {
      const db = this.dbManager.getInstance();
      db.run(
        `INSERT OR REPLACE INTO class_config (horario, limite) VALUES (?, ?)`,
        [horario, limite],
      );
      this.dbManager.save();
    } catch (error) {
      console.error("Erro ao salvar limite:", error);
      throw error;
    }
  }
}
