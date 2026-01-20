import { Cadastro } from "../../types/typeCadastro";

interface Props {
  student: Cadastro;
  onClose: () => void;
  onEdit: () => void; // Ação para quando clicar em "Editar"
}

export default function ModalDetalhesAluno({
  student,
  onClose,
  onEdit,
}: Props) {
  // Helpers visuais (formatadores)
  const formatMoney = (val?: number) => `R$ ${(Number(val) || 0).toFixed(2)}`;
  const getPhoto = () =>
    student.fotoUrl ? `media://${student.fotoUrl.replace(/\\/g, "/")}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* CABEÇALHO COM FOTO E NOME */}
        <div className="relative bg-stone-100 p-6 flex flex-col items-center border-b border-stone-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition text-stone-500"
          >
            ✕
          </button>

          <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md overflow-hidden mb-3 flex items-center justify-center text-stone-300">
            {getPhoto() ? (
              <img
                src={getPhoto()!}
                alt={student.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          <h2 className="text-2xl font-serif font-bold text-stone-800 text-center">
            {student.nome}
          </h2>
          <span className="text-sm font-mono text-stone-500 bg-white px-3 py-1 rounded-full border border-stone-200 mt-2 shadow-sm">
            {student.turma}
          </span>
        </div>

        {/* CORPO COM INFORMAÇÕES (READ-ONLY) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Seção 1: Dados Pessoais */}
          <div>
            <h3 className="text-xs font-bold text-[#8CAB91] uppercase tracking-widest mb-3 border-b border-stone-100 pb-1">
              Dados Pessoais
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-stone-400 text-xs">CPF</span>
                <span className="text-stone-700 font-medium">
                  {student.cpf}
                </span>
              </div>
              <div>
                <span className="block text-stone-400 text-xs">RG</span>
                <span className="text-stone-700 font-medium">
                  {student.rg || "-"}
                </span>
              </div>
              <div>
                <span className="block text-stone-400 text-xs">Nascimento</span>
                <span className="text-stone-700 font-medium">
                  {student.dataNascimento
                    ? new Date(student.dataNascimento).toLocaleDateString(
                        "pt-BR",
                      )
                    : "-"}
                </span>
              </div>
              <div>
                <span className="block text-stone-400 text-xs">Telefone</span>
                <span className="text-stone-700 font-medium">
                  {student.telefone}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-stone-400 text-xs">Endereço</span>
                <span className="text-stone-700 font-medium">
                  {student.endereco}
                </span>
              </div>
            </div>
          </div>

          {/* Seção 2: Financeiro */}
          <div>
            <h3 className="text-xs font-bold text-[#8CAB91] uppercase tracking-widest mb-3 border-b border-stone-100 pb-1">
              Financeiro
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm bg-[#8CAB91]/5 p-4 rounded-lg border border-[#8CAB91]/20">
              <div>
                <span className="block text-stone-500 text-xs">
                  Mensalidade
                </span>
                <span className="text-stone-800 font-bold text-lg">
                  {formatMoney(student.valorMensalidade)}
                </span>
              </div>
              <div>
                <span className="block text-stone-500 text-xs">
                  Dia Vencimento
                </span>
                <span className="text-stone-800 font-bold">
                  Dia {student.diaVencimento}
                </span>
              </div>
              <div>
                <span className="block text-stone-500 text-xs">Plano</span>
                <span className="text-stone-800 font-medium">
                  {student.planoMensal}
                </span>
              </div>
              <div>
                <span className="block text-stone-500 text-xs">
                  Forma Pagto
                </span>
                <span className="text-stone-800 font-medium">
                  {student.formaPagamento}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RODAPÉ COM AÇÕES */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition text-sm font-medium"
          >
            Fechar
          </button>

          <button
            onClick={onEdit}
            className="px-6 py-2 bg-[#8CAB91] text-white hover:bg-[#7A9B7F] rounded-lg shadow-sm hover:shadow-md transition flex items-center gap-2 font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Editar Dados
          </button>
        </div>
      </div>
    </div>
  );
}
