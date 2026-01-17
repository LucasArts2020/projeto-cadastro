import {
  HashRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import TelaCadastro from "./pages/TelaCadastro";
import TelaListagem from "./pages/TelaListagem";

const Icons = {
  Dashboard: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  ),
  Users: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  AddUser: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
      />
    </svg>
  ),
};

function Sidebar() {
  const linkClass =
    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group";

  const activeClass = "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50";
  const inactiveClass = "text-slate-400 hover:bg-white/5 hover:text-white";

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20 shadow-xl border-r border-white/5">
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
    </aside>
  );
}

function Header() {
  const location = useLocation();
  const getTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Nova Matrícula";
      case "/lista":
        return "Gestão de Alunos";
      default:
        return "Painel";
    }
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          {getTitle()}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Sistema de Gestão Escolar
        </p>
      </div>
    </header>
  );
}

function WrapperCadastro() {
  const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200 border border-gray-100 overflow-hidden">
        <TelaCadastro onSuccess={() => navigate("/lista")} />
      </div>
    </div>
  );
}

function WrapperLista() {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <TelaListagem />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col">
          <Header />
          <main className="flex-1 p-8 overflow-y-auto">
            <Routes>
              <Route path="/" element={<WrapperCadastro />} />
              <Route path="/lista" element={<WrapperLista />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}
