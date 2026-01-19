import { Cadastro } from "../types/typeCadastro";

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

// Interface para os filtros
export interface HistoryFilters {
  startDate?: string;
  endDate?: string;
}

export const AttendanceService = {
  // Salvar chamada
  save: async (data: AttendancePayload) => {
    // @ts-ignore
    return await window.api.saveAttendance(data);
  },

  // Buscar histórico (Unificado: Aceita filtros ou undefined)
  getHistory: async (filters?: HistoryFilters): Promise<HistoricoItem[]> => {
    // @ts-ignore
    return await window.api.getAttendanceHistory(filters);
  },

  // Buscar detalhes de uma aula específica
  getDetails: async (classId: number): Promise<ClassDetailItem[]> => {
    // @ts-ignore
    return await window.api.getClassDetails(classId);
  },
};
