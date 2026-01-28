export const ConfigService = {
  async getLimits(): Promise<Record<string, number>> {
    // @ts-ignore
    return await window.api.getLimits();
  },
  async saveLimit(horario: string, limite: number): Promise<void> {
    // @ts-ignore
    return await window.api.saveLimit({ horario, limite });
  },
};
