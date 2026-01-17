import { NavLink } from "react-router-dom";
import { Icons } from "../common/Icons";

export default function Sidebar() {
  const linkClass =
    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group";

  const activeClass = "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50";
  const inactiveClass = "text-slate-400 hover:bg-white/5 hover:text-white";

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20 shadow-xl border-r border-white/5">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/30">
          <span className="font-bold text-white text-xl">E</span>
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wide text-white">
            Escola<span className="text-indigo-400 font-extrabold">Pro</span>
          </h1>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          Principal
        </p>

        <NavLink
          to="/"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <Icons.AddUser />
          <span>Nova Matrícula</span>
        </NavLink>

        <NavLink
          to="/lista"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <Icons.Users />
          <span>Alunos & Turmas</span>
        </NavLink>
      </nav>

      {/* Footer Sidebar */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold ring-2 ring-slate-800">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Administrador
            </p>
            <p className="text-xs text-slate-500 truncate">Online agora</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
