import { Icons } from "../common/Icons";

interface Props {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onNewStudent: () => void;
  onFilterClick: () => void;
  activeFiltersCount?: number;
}

export default function ActionBar({
  searchTerm,
  onSearchChange,
  onNewStudent,
  onFilterClick,
  activeFiltersCount = 0,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
      <div className="relative w-full md:w-96 group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400 group-focus-within:text-[#8CAB91] transition-colors">
          <Icons.Search />
        </div>
        <input
          type="text"
          placeholder="Buscar por nome, CPF ou turma..."
          className="pl-10 pr-4 py-3 w-full rounded-xl bg-stone-50 border-none focus:ring-2 focus:ring-[#8CAB91]/50 outline-none text-stone-600 transition-all placeholder-stone-400"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex gap-3 w-full md:w-auto">
        <button
          onClick={onFilterClick}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all relative ${
            activeFiltersCount > 0
              ? "bg-[#8CAB91]/10 border-[#8CAB91] text-[#5A7A60]"
              : "bg-white border-stone-200 text-stone-500 hover:border-[#8CAB91] hover:text-[#8CAB91]"
          }`}
        >
          <Icons.Filter />
          <span className="font-medium text-sm">Filtros</span>

          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <button
          onClick={onNewStudent}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#2C2C2C] text-white px-6 py-3 rounded-xl hover:bg-black transition-all shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          <Icons.AddUser />
          <span className="font-bold text-sm tracking-wide">NOVO ALUNO</span>
        </button>
      </div>
    </div>
  );
}
