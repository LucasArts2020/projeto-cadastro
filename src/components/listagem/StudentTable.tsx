import { Cadastro } from "../../types/typeCadastro";

interface Props {
  students: Cadastro[];
  loading: boolean;
  onSelect: (student: Cadastro) => void;
  onDelete: (student: Cadastro) => void;
  onConfirmPayment: (student: Cadastro) => void;
}

export default function StudentTable({
  students,
  loading,
  onSelect,
  onDelete,
  onConfirmPayment,
}: Props) {
  // --- LÓGICA DE FORMATAÇÃO DO HORÁRIO ---
  const renderHorario = (dias: any) => {
    if (!dias || (Array.isArray(dias) && dias.length === 0)) {
      return <span className="text-stone-400 italic text-xs">--</span>;
    }

    let listaDias: { dia: string; horario?: string }[] = [];

    // Normaliza os dados (caso venha string antiga ou objeto novo)
    if (Array.isArray(dias)) {
      listaDias = dias.map((item: any) => {
        if (typeof item === "string") return { dia: item, horario: "" };
        return item;
      });
    }

    // Ordenação dos dias (Seg -> Dom)
    const ordem = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
    listaDias.sort((a, b) => ordem.indexOf(a.dia) - ordem.indexOf(b.dia));

    // Verifica se todos os horários são iguais (para agrupar visualmente)
    const primeiroHorario = listaDias[0]?.horario;
    const todosIguais = listaDias.every((d) => d.horario === primeiroHorario);

    // CASO 1: Horários iguais (Ex: Seg, Qua • 08:00)
    if (todosIguais && primeiroHorario) {
      const diasTexto = listaDias.map((d) => d.dia).join(", ");
      return (
        <div className="flex flex-col justify-center">
          <span className="text-sm font-bold text-stone-700">
            {primeiroHorario}
          </span>
          <span className="text-xs text-stone-500 capitalize">{diasTexto}</span>
        </div>
      );
    }

    // CASO 2: Horários diferentes ou mistos
    return (
      <div className="flex flex-col gap-1 justify-center">
        {listaDias.map((d, idx) => (
          <div key={idx} className="text-xs text-stone-600">
            <span className="font-bold mr-1">{d.dia}</span>
            <span className="text-stone-500">{d.horario || "?"}</span>
          </div>
        ))}
      </div>
    );
  };
  // ----------------------------------------

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getStatusColor = (diaVencimento: string | number) => {
    const dia = Number(diaVencimento);
    if (dia <= 10) return "bg-[#8CAB91]/20 text-[#5A7A60] border-[#8CAB91]/30";
    if (dia <= 20) return "bg-stone-100 text-stone-600 border-stone-200";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  return (
    <div className="bg-white shadow-sm border border-stone-100 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-full">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest w-[30%]">
                Aluno
              </th>
              <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest w-[25%]">
                Horário
              </th>
              <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest w-[15%]">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-right w-[15%]">
                Valor
              </th>
              <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-center w-[15%]">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-stone-400 font-serif"
                >
                  Carregando...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-stone-500"
                >
                  Nenhum aluno encontrado.
                </td>
              </tr>
            ) : (
              students.map((student, index) => (
                <tr
                  key={index}
                  onClick={() => onSelect(student)}
                  className="group hover:bg-[#8CAB91]/5 transition-colors border-b border-stone-50 last:border-0 cursor-pointer"
                >
                  {/* ALUNO - Centralizado verticalmente */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#8CAB91] text-white flex items-center justify-center font-serif font-bold text-sm shadow-sm overflow-hidden shrink-0 border border-[#8CAB91]/20">
                        {student.fotoUrl ? (
                          <img
                            src={`media://${student.fotoUrl}`}
                            alt={student.nome}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span>{getInitials(student.nome)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-serif font-medium text-stone-800 truncate">
                          {student.nome}
                        </div>
                        <div className="text-xs text-stone-400 font-mono">
                          {student.cpf}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* HORÁRIO - Correção aplicada aqui */}
                  <td className="px-6 py-4 align-middle">
                    {renderHorario(student.diasSemana)}
                  </td>

                  {/* STATUS - Centralizado */}
                  <td className="px-6 py-4 align-middle">
                    {student.pago ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                        Pago
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          student.diaVencimento,
                        )}`}
                      >
                        Pendente • vence {student.diaVencimento}
                      </span>
                    )}
                  </td>

                  {/* VALOR - Centralizado */}
                  <td className="px-6 py-4 align-middle text-right">
                    <span className="font-serif font-medium text-stone-800">
                      R$ {Number(student.valorMensalidade || 0).toFixed(2)}
                    </span>
                  </td>

                  {/* AÇÕES - Centralizado */}
                  <td className="px-6 py-4 align-middle text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(student);
                      }}
                      title="Excluir Aluno"
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 mx-auto"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
