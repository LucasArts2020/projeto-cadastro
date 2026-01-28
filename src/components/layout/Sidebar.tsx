import { NavLink } from "react-router-dom";
import { Icons } from "../common/Icons";

export default function Sidebar() {
  const linkClass =
    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group";

  const activeClass = "bg-[#8CAB91] text-white shadow-lg shadow-[#8CAB91]/40";
  const inactiveClass = "text-stone-400 hover:bg-white/5 hover:text-white";

  return (
    <aside className="w-64 bg-[#2C2C2C] text-white flex flex-col fixed h-full z-20 shadow-xl border-r border-white/5">
      <div className="h-24 flex flex-col items-center justify-center border-b border-white/5 py-4">
        <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center mb-2">
          <span className="text-2xl font-serif">R</span>
        </div>
        <div>
          <h1 className="font-serif font-medium text-lg tracking-[0.2em] text-white uppercase">
            Roncon
          </h1>
          <p className="text-[10px] text-[#8CAB91] tracking-[0.3em] text-center uppercase">
            Studio
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
        <p className="px-4 text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">
          Menu
        </p>

        <NavLink
          to="/"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <Icons.Users />
          <span>Alunos</span>
        </NavLink>

        <NavLink
          to="/cadastro"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <Icons.AddUser />
          <span>Nova Matrícula</span>
        </NavLink>

        <NavLink
          to="/turmas"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <Icons.Calendar />
          <span>Turmas</span>
        </NavLink>

        {/* Link para Reposições adicionado aqui */}
        <NavLink
          to="/reposicao"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          {/* Reutilizei o ícone Calendar, mas você pode usar Icons.CheckCircle se preferir diferenciar */}
          <Icons.Calendar />
          <span>Reposições</span>
        </NavLink>

        <NavLink
          to="/historico"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <Icons.FileText />
          <span>Histórico</span>
        </NavLink>
      </nav>
    </aside>
  );
}
