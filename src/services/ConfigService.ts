// Exemplo base seguindo seu padrão
export const ConfigService = {
  async getLimits(): Promise<Record<string, number>> {
    // @ts-ignore
    // Substitua pela sua chamada IPC real, ex: window.api.getLimits()
    return await window.electron.getLimits();
  },
  async saveLimit(horario: string, limite: number): Promise<void> {
    // @ts-ignore
    return await window.electron.saveLimit(horario, limite);
  },
};
