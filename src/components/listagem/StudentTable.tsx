import { Cadastro } from "../../types/typeCadastro";

interface Props {
  students: Cadastro[];
  loading: boolean;
  onSelect: (student: Cadastro) => void;
  onDelete: (student: Cadastro) => void;
}

export default function StudentTable({
  students,
  loading,
  onSelect,
  onDelete,
}: Props) {
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
    <div className="bg-white shadow-sm border border-stone-100">
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
                  className="group hover:bg-[#8CAB91]/5 transition-colors border-b border-stone-50 last:border-0 cursor-pointer relative"
                >
                  <td className="px-6 py-4">
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

                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-stone-700">
                        {student.horarioAula || "—"}
                      </span>
                      <span className="text-xs text-stone-500 capitalize">
                        {student.diasSemana && student.diasSemana.length > 0
                          ? student.diasSemana.join(", ")
                          : "Sem dias def."}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(student.diaVencimento)}`}
                    >
                      Vence dia {student.diaVencimento}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span className="font-serif font-medium text-stone-800">
                      R$ {Number(student.valorMensalidade || 0).toFixed(2)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(student);
                      }}
                      title="Excluir Aluno"
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
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
