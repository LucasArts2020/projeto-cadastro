export interface Cadastro {
  nome: string;
  rg: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  telefone2: string;
  endereco: string;
  fotoUrl: File | null;
  turma: string;
  valorMatricula: number;
  planoMensal: string;
  valorMensalidade: number;
  formaPagamento: string;
  diaVencimento: number | "";
}
