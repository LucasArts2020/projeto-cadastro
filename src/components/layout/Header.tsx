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
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-stone-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
      <div>
        <h2 className="text-2xl font-serif text-stone-800 flex items-center gap-2">
          {getTitle()}
        </h2>
        <p className="text-xs text-[#8CAB91] mt-0.5 tracking-wider uppercase font-medium">
          Painel Administrativo
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 hover:text-[#8CAB91] hover:border-[#8CAB91] transition-all cursor-pointer relative">
          🔔
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#8CAB91] rounded-full border border-white"></span>
        </div>
      </div>
    </header>
  );
}
