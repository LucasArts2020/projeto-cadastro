export interface Cadastro {
  nome: string;
  rg: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  telefone2: string;
  endereco: string;
  fotoFile?: File | null;
  fotoUrl?: string;
  turma: string;
  valorMatricula: number;
  planoMensal: string;
  valorMensalidade: number;
  formaPagamento: string;
  diaVencimento: number | "";
}
export interface Aula {
  id?: number;
  turma: string;
  dataAula: string;
  descricao?: string;
}

export interface RegistroFalta {
  studentId: number;
  classId: number;
  status: "presente" | "falta" | "justificado";
}
