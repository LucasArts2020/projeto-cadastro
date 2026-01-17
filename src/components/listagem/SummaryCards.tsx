import { Icons } from "../common/Icons";

interface Props {
  total: number;
  receita: number;
  ticketMedio: number;
}

export default function SummaryCards({ total, receita, ticketMedio }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Total de Alunos
          </p>
          <h3 className="text-3xl font-bold text-gray-800">{total}</h3>
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
            <Icons.TrendUp />
            <span>Ativos</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-2xl">
          🎓
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Receita Mensal (Est.)
          </p>
          <h3 className="text-3xl font-bold text-gray-800">
            R$ {receita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-gray-400 mt-2">
            Baseado nos contratos ativos
          </p>
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-2xl">
          💰
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Ticket Médio</p>
          <h3 className="text-3xl font-bold text-gray-800">
            R${" "}
            {ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-gray-400 mt-2">Média por aluno</p>
        </div>
        <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-2xl">
          📊
        </div>
      </div>
    </div>
  );
}
