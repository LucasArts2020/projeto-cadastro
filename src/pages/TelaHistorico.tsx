import { useEffect, useState, useMemo } from "react";
import {
  AttendanceService,
  HistoricoItem,
  ClassDetailItem,
} from "../services/AttendanceService";
import { Icons } from "../components/common/Icons";
import { OPCOES_HORARIOS } from "../utils/options";

export default function TelaHistorico() {
  const [history, setHistory] = useState<HistoricoItem[]>([]);
  const [details, setDetails] = useState<ClassDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<"LISTA" | "DETALHES">("LISTA");
  const [selectedClass, setSelectedClass] = useState<HistoricoItem | null>(
    null,
  );

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterTime, setFilterTime] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await AttendanceService.getHistory({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setHistory(data);
    } catch (error) {
      console.error("Erro ao carregar histórico", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: HistoricoItem) => {
    const confirmou = window.confirm(
      `Deseja excluir o registro da aula "${item.turma}" do dia ${formatDate(item.data_aula)}?\n\nIsso apagará as presenças lançadas para esta aula.`,
    );

    if (confirmou) {
      setLoading(true);
      try {
        const response = await AttendanceService.delete(item.id);
        if (response.success) {
          loadHistory();
        } else {
          alert("Erro ao excluir: " + response.error);
        }
      } catch (error) {
        console.error(error);
        alert("Erro de conexão.");
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredHistory = useMemo(() => {
    if (!filterTime) return history;
    return history.filter((item) => item.turma.includes(filterTime));
  }, [history, filterTime]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterTime("");
    loadHistory(); // Recarrega tudo limpo
  };

  const handleOpenDetails = async (item: HistoricoItem) => {
    setLoading(true);
    setSelectedClass(item);
    try {
      const data = await AttendanceService.getDetails(item.id);
      setDetails(data);
      setViewState("DETALHES");
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar detalhes");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setViewState("LISTA");
    setDetails([]);
    setSelectedClass(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/30 relative">
      <div className="p-6 border-b border-gray-100 bg-white shadow-sm flex flex-col gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          {viewState === "DETALHES" && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <span className="text-xl">←</span>
            </button>
          )}

          <div>
            <h2 className="text-2xl font-serif text-gray-800">
              {viewState === "LISTA"
                ? "Histórico de Aulas"
                : `Relatório: ${selectedClass?.turma}`}
            </h2>
            <p className="text-sm text-gray-500">
              {viewState === "LISTA"
                ? "Registro de todas as chamadas realizadas."
                : `Realizada em ${selectedClass ? formatDate(selectedClass.data_aula) : ""}`}
            </p>
          </div>
        </div>

        {viewState === "LISTA" && (
          <div className="flex flex-wrap items-end gap-3 mt-2 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase">
                De
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#8CAB91] outline-none bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase">
                Até
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#8CAB91] outline-none bg-gray-50 text-gray-600"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase">
                Horário
              </label>
              <select
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#8CAB91] outline-none bg-gray-50 text-gray-600 appearance-none cursor-pointer"
              >
                <option value="">Todos</option>
                {OPCOES_HORARIOS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={loadHistory}
              className="px-6 py-2 bg-[#2C2C2C] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-black/10 flex items-center gap-2 h-9.5"
            >
              <Icons.Filter /> Filtrar
            </button>
            {(startDate || endDate || filterTime) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-red-400 hover:text-red-600 text-sm font-medium transition-colors h-9.5"
              >
                Limpar
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto pb-20">
        {loading && (
          <div className="text-center py-10 text-gray-400">Carregando...</div>
        )}

        {!loading && viewState === "LISTA" && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <div className="text-4xl mb-4">📅</div>
                <p>Nenhum registro encontrado.</p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenDetails(item)}
                  className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#8CAB91]/30 hover:-translate-y-1 transition-all cursor-pointer flex justify-between items-center group relative pr-14" // Adicionado pr-14 para dar espaço pro botão
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 text-gray-400 group-hover:bg-[#8CAB91] group-hover:text-white rounded-full flex items-center justify-center transition-colors">
                      <Icons.FileText />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {item.turma}
                      </h3>
                      <p className="text-sm text-gray-500">
                        📅 {formatDate(item.data_aula)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right mr-4">
                    <span className="text-2xl font-bold text-[#8CAB91]">
                      {item.presentes}
                    </span>
                    <span className="text-sm text-gray-400 font-medium">
                      {" "}
                      / {item.total_alunos}
                    </span>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Presentes
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="Excluir Registro"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && viewState === "DETALHES" && selectedClass && (
          <div className="max-w-5xl mx-auto animate-fade-in-up">
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                <span className="text-3xl font-bold text-gray-800">
                  {selectedClass.total_alunos}
                </span>
                <span className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                  Total Alunos
                </span>
              </div>
              <div className="bg-[#8CAB91]/10 p-6 rounded-2xl border border-[#8CAB91]/20 shadow-sm flex flex-col items-center">
                <span className="text-3xl font-bold text-[#8CAB91]">
                  {selectedClass.presentes}
                </span>
                <span className="text-xs text-[#8CAB91] uppercase tracking-widest mt-1 font-bold">
                  Presentes
                </span>
              </div>
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm flex flex-col items-center">
                <span className="text-3xl font-bold text-red-400">
                  {selectedClass.total_alunos - selectedClass.presentes}
                </span>
                <span className="text-xs text-red-400 uppercase tracking-widest mt-1 font-bold">
                  Faltas
                </span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-700 mb-4 px-1">
              Lista de Presença
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {details.map((aluno) => (
                <div
                  key={aluno.studentId}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${aluno.status === "presente" ? "bg-white border-[#8CAB91]/30 shadow-sm" : "bg-gray-50 border-gray-200 opacity-70"}`}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border border-gray-100 shrink-0">
                    {aluno.fotoUrl ? (
                      <img
                        src={`media://${aluno.fotoUrl}`}
                        alt={aluno.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                        {aluno.nome.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">
                      {aluno.nome}
                    </h4>
                    <div className="mt-1">
                      {aluno.status === "presente" && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8CAB91] bg-[#8CAB91]/10 px-2 py-0.5 rounded-md">
                          <Icons.CheckCircle className="w-3 h-3" /> Presente
                        </span>
                      )}
                      {aluno.status === "falta" && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 bg-red-50 px-2 py-0.5 rounded-md">
                          <Icons.XCircle className="w-3 h-3" /> Falta
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
