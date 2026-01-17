import { Icons } from "../common/Icons";

interface Props {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onNewStudent: () => void;
}

export default function ActionBar({
  searchTerm,
  onSearchChange,
  onNewStudent,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div className="relative w-full md:w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icons.Search />
        </div>
        <input
          type="text"
          placeholder="Buscar por nome, CPF ou turma..."
          className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex gap-3 w-full md:w-auto">
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white">
          <Icons.Filter />
          <span>Filtros</span>
        </button>

        <button
          onClick={onNewStudent}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all w-full md:w-auto justify-center"
        >
          + Novo Aluno
        </button>
      </div>
    </div>
  );
}
