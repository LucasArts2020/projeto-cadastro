import { useLocation } from "react-router-dom";

export default function Header() {
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
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          {getTitle()}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Sistema de Gestão Escolar
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer relative">
          🔔
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </div>
      </div>
    </header>
  );
}
