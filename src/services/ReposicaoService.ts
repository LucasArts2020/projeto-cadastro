export const ReposicaoService = {
  getAbsences: async () => {
    // @ts-ignore
    return await window.api.getAbsences();
  },
  checkAvailability: async (date: string, dayOfWeek: string) => {
    // @ts-ignore
    return await window.api.checkAvailability(date, dayOfWeek);
  },
  schedule: async (data: {
    student_id: number;
    attendance_id: number;
    data_reposicao: string;
    horario: string;
  }) => {
    // @ts-ignore
    return await window.api.scheduleReplacement(data);
  },
  getReplacementsByDate: async (date: string) => {
    // @ts-ignore
    return await window.api.getReplacementsByDate(date);
  },
};
