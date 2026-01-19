import { useState, useEffect, useMemo } from "react";
import { CadastroService } from "../services/CadastroService";
import { Cadastro } from "../types/typeCadastro";
import { Icons } from "../components/common/Icons";

export default function TelaTurmas() {
  const [students, setStudents] = useState<Cadastro[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros (Inicializa com o dia atual para facilitar)
  const [filtroDia, setFiltroDia] = useState<string>(getDiaAtualFormatado());
  const [filtroHorario, setFiltroHorario] = useState<string>("");
  const [filtroTurma, setFiltroTurma] = useState<string>("");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const list = await CadastroService.list();
      setStudents(list);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para pegar dia da semana atual (Ex: "Seg")
  function getDiaAtualFormatado() {
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    return dias[new Date().getDay()];
  }

  // Lógica CORE: Filtra alunos que batem com os critérios
  const studentsFiltered = useMemo(() => {
    return students.filter((s) => {
      // 1. Verifica se o aluno tem o dia selecionado em sua lista de dias
      // Se não tiver dias definidos, assume que vai todos (opcional) ou nenhum.
      const bateDia = s.diasSemana ? s.diasSemana.includes(filtroDia) : false;

      // 2. Verifica horário (se filtro estiver vazio, traz todos os horários do dia)
      const bateHorario = filtroHorario
        ? s.horarioAula === filtroHorario
        : true;

      // 3. Verifica Turma/Modalidade
      const bateTurma = filtroTurma
        ? s.turma.toLowerCase().includes(filtroTurma.toLowerCase())
        : true;

      return bateDia && bateHorario && bateTurma;
    });
  }, [students, filtroDia, filtroHorario, filtroTurma]);

  return (
    <div className="flex flex-col h-full">
      {/* Header da Tela */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-gray-800">
            Gestão de Turmas
          </h2>
          <p className="text-sm text-gray-500">
            Visualize quem deve comparecer hoje ou em horários específicos.
          </p>
        </div>

        {/* Barra de Filtros */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
          <select
            value={filtroDia}
            onChange={(e) => setFiltroDia(e.target.value)}
            className="text-sm border-none focus:ring-0 text-gray-700 font-medium bg-transparent cursor-pointer"
          >
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <div className="w-px h-6 bg-gray-200"></div>

          <input
            type="time"
            value={filtroHorario}
            onChange={(e) => setFiltroHorario(e.target.value)}
            className="text-sm border-none focus:ring-0 text-gray-700 bg-transparent"
          />
          <div className="w-px h-6 bg-gray-200"></div>

          <input
            type="text"
            placeholder="Filtrar Modalidade..."
            value={filtroTurma}
            onChange={(e) => setFiltroTurma(e.target.value)}
            className="text-sm border-none focus:ring-0 text-gray-700 bg-transparent w-40"
          />
        </div>
      </div>

      {/* Conteúdo Principal - Lista */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Carregando...</div>
        ) : studentsFiltered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Icons.Users className="w-12 h-12 mb-3 opacity-20" />
            <p>Nenhum aluno encontrado para este dia/horário.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentsFiltered.map((student) => (
              <CardChamada key={student.id} student={student} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente visual do Card de Aluno para Chamada
function CardChamada({ student }: { student: Cadastro }) {
  const [status, setStatus] = useState<"pendente" | "presente" | "falta">(
    "pendente",
  );

  return (
    <div
      className={`
      relative p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 group bg-white
      ${status === "presente" ? "border-[#8CAB91] shadow-lg shadow-[#8CAB91]/10" : "border-gray-100 shadow-sm hover:shadow-md"}
    `}
    >
      {/* Foto / Avatar */}
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
        {student.fotoUrl ? (
          <img
            src={`media://${student.fotoUrl}`}
            alt={student.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-lg font-serif text-gray-400">
            {student.nome.charAt(0)}
          </span>
        )}
      </div>

      {/* Dados */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-800 truncate">{student.nome}</h4>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
            {student.horarioAula || "--:--"}
          </span>
          <span className="truncate">{student.turma}</span>
        </div>
      </div>

      {/* Ações de Chamada */}
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setStatus("presente")}
          className={`p-2 rounded-lg transition-colors ${status === "presente" ? "bg-[#8CAB91] text-white" : "text-gray-300 hover:bg-[#8CAB91]/10 hover:text-[#8CAB91]"}`}
        >
          <Icons.CheckCircle className="w-5 h-5" />
        </button>
        <button
          onClick={() => setStatus("falta")}
          className={`p-2 rounded-lg transition-colors ${status === "falta" ? "bg-red-100 text-red-500" : "text-gray-300 hover:bg-red-50 hover:text-red-500"}`}
        >
          <Icons.XCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
