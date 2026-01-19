import { useEffect, useState, useMemo } from "react";
import {
  AttendanceService,
  HistoricoItem,
  ClassDetailItem,
} from "../services/AttendanceService";
import { Icons } from "../components/common/Icons";
// 1. Importamos os horários para usar no filtro
import { OPCOES_HORARIOS } from "../utils/options";

export default function TelaHistorico() {
  // Estados de Dados
  const [history, setHistory] = useState<HistoricoItem[]>([]);
  const [details, setDetails] = useState<ClassDetailItem[]>([]);

  // Estados de Controle
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<"LISTA" | "DETALHES">("LISTA");
  const [selectedClass, setSelectedClass] = useState<HistoricoItem | null>(
    null,
  );

  // Estados do Filtro
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // 2. Novo estado para filtrar por horário
  const [filterTime, setFilterTime] = useState("");

  // Carregar lista inicial
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

  // 3. Lógica de Filtragem Local (Cliente)
  // Filtra a lista já carregada pelo horário selecionado
  const filteredHistory = useMemo(() => {
    if (!filterTime) return history;
    return history.filter((item) => item.turma.includes(filterTime));
  }, [history, filterTime]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterTime(""); // Limpa horário também
    setLoading(true);
    AttendanceService.getHistory({})
      .then(setHistory)
      .finally(() => setLoading(false));
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
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/30 relative">
      {/* --- HEADER --- */}
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

        {/* --- BARRA DE FILTROS --- */}
        {viewState === "LISTA" && (
          <div className="flex flex-wrap items-end gap-3 mt-2 animate-fade-in">
            {/* Input Data Início */}
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

            {/* Input Data Fim */}
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

            {/* 4. NOVO FILTRO: HORÁRIO */}
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

            {/* Botão Filtrar */}
            <button
              onClick={loadHistory}
              className="px-6 py-2 bg-[#2C2C2C] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-black/10 flex items-center gap-2 h-[38px]"
            >
              <Icons.Filter />
              Filtrar
            </button>

            {/* Botão Limpar */}
            {(startDate || endDate || filterTime) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-red-400 hover:text-red-600 text-sm font-medium transition-colors h-[38px]"
              >
                Limpar
              </button>
            )}
          </div>
        )}
      </div>

      {/* --- CONTEÚDO --- */}
      <div className="flex-1 p-6 overflow-y-auto pb-20">
        {loading && (
          <div className="text-center py-10 text-gray-400">Carregando...</div>
        )}

        {/* LISTA */}
        {!loading && viewState === "LISTA" && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <div className="text-4xl mb-4">📅</div>
                <p>Nenhum registro encontrado.</p>
              </div>
            ) : (
              // 5. Usamos filteredHistory aqui em vez de history
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenDetails(item)}
                  className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#8CAB91]/30 hover:-translate-y-1 transition-all cursor-pointer flex justify-between items-center group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 text-gray-400 group-hover:bg-[#8CAB91] group-hover:text-white rounded-full flex items-center justify-center transition-colors">
                      <Icons.FileText />
                    </div>
                    <div>
                      {/* Como o nome agora é "Treino das 19:00", ele aparecerá aqui */}
                      <h3 className="text-lg font-bold text-gray-800">
                        {item.turma}
                      </h3>
                      <p className="text-sm text-gray-500">
                        📅 {formatDate(item.data_aula)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
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
                </div>
              ))
            )}
          </div>
        )}

        {/* DETALHES (Mantido igual) */}
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
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border transition-all
                    ${
                      aluno.status === "presente"
                        ? "bg-white border-[#8CAB91]/30 shadow-sm"
                        : "bg-gray-50 border-gray-200 opacity-70"
                    }
                  `}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border border-gray-100 shrink-0">
                    {aluno.fotoUrl ? (
                      <img
                        src={aluno.fotoUrl}
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
