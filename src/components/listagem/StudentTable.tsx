import { Cadastro } from "../../types/typeCadastro";
import { Icons } from "../common/Icons";

interface Props {
  students: Cadastro[];
  loading: boolean;
}

export default function StudentTable({ students, loading }: Props) {
  // Helpers internos para formatação visual
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getStatusColor = (diaVencimento: string | number) => {
    const dia = Number(diaVencimento);
    if (dia <= 10) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (dia <= 20) return "bg-indigo-100 text-indigo-700 border-indigo-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Aluno
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Turma & Plano
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status Financeiro
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                Mensalidade
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  Carregando...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  Nenhum aluno encontrado.
                </td>
              </tr>
            ) : (
              students.map((student, index) => (
                <tr
                  key={index}
                  className="hover:bg-indigo-50/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20">
                        {getInitials(student.nome)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {student.nome}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {student.cpf}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        {student.turma}
                      </span>
                      <span className="text-xs text-gray-500">
                        {student.planoMensal}
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
                    <span className="font-bold text-gray-900">
                      R$ {Number(student.valorMensalidade || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Icons.More />
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
