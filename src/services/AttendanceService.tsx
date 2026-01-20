export interface AttendancePayload {
  turma: string;
  dataAula: string;
  registros: {
    studentId: number;
    status: "presente" | "falta" | "justificado";
  }[];
}

export interface HistoricoItem {
  id: number;
  turma: string;
  data_aula: string;
  total_alunos: number;
  presentes: number;
}

export interface ClassDetailItem {
  studentId: number;
  nome: string;
  fotoUrl: string | null;
  status: "presente" | "falta" | "justificado";
}

export interface HistoryFilters {
  startDate?: string;
  endDate?: string;
}

export const AttendanceService = {
  save: async (data: AttendancePayload) => {
    // @ts-ignore
    return await window.api.saveAttendance(data);
  },

  getHistory: async (filters?: HistoryFilters): Promise<HistoricoItem[]> => {
    // @ts-ignore
    return await window.api.getAttendanceHistory(filters);
  },

  getDetails: async (classId: number): Promise<ClassDetailItem[]> => {
    // @ts-ignore
    return await window.api.getClassDetails(classId);
  },
  delete: async (id: number) => {
    // @ts-ignore
    return await window.api.deleteClass(id);
  },
};
