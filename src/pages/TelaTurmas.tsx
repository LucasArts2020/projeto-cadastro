import { useState, useEffect, useMemo } from "react";
import { CadastroService } from "../services/CadastroService";
import { AttendanceService } from "../services/AttendanceService";
import { ConfigService } from "../services/ConfigService";
import { ReposicaoService } from "../services/ReposicaoService";
import { Cadastro } from "../types/typeCadastro";
import { Icons } from "../components/common/Icons";
import Popup from "../components/layout/popup";

type ViewState = "SELECAO" | "CHAMADA";

interface ClassGroup {
  turma: string;
  horario: string;
  totalAlunos: number;
  alunos: (Cadastro & { isReposicao?: boolean })[];
}

export default function TelaTurmas() {
  const [students, setStudents] = useState<Cadastro[]>([]);
  const [replacements, setReplacements] = useState<Cadastro[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>("SELECAO");

  const [diaFiltro, setDiaFiltro] = useState<string>(getDiaAtualSigla());
  const [limits, setLimits] = useState<Record<string, number>>({});

  // Estado "showConfig" foi removido pois agora existe uma tela dedicada.

  const [selectedGroup, setSelectedGroup] = useState<ClassGroup | null>(null);
  const [presencas, setPresencas] = useState<
    Record<number, "presente" | "falta" | "justificado">
  >({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadReplacements();
  }, [diaFiltro]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [list, limitsData] = await Promise.all([
        CadastroService.list(),
        ConfigService.getLimits(),
      ]);
      setStudents(list);
      setLimits(limitsData);
    } finally {
      setLoading(false);
    }
  };

  const loadReplacements = async () => {
    const dataCalculada = getDateFromDayOfWeek(diaFiltro);
    if (dataCalculada) {
      const reps = await ReposicaoService.getReplacementsByDate(dataCalculada);
      setReplacements(reps);
    } else {
      setReplacements([]);
    }
  };

  function getDiaAtualSigla() {
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    const hoje = new Date().getDay();
    return dias[hoje] === "Dom" ? "Seg" : dias[hoje];
  }

  function getDateFromDayOfWeek(daySigla: string) {
    const map: Record<string, number> = {
      Dom: 0,
      Seg: 1,
      Ter: 2,
      Qua: 3,
      Qui: 4,
      Sex: 5,
      Sab: 6,
    };
    const targetDay = map[daySigla];
    if (targetDay === undefined) return null;

    const hoje = new Date();
    const currentDay = hoje.getDay();

    const diff = targetDay - currentDay;

    const targetDate = new Date(hoje);
    targetDate.setDate(hoje.getDate() + diff);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getDataExibicao() {
    return new Date().toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const getLimitForClass = (horario: string) => limits[horario] ?? 6;

  const turmasDoDia = useMemo(() => {
    const groups: Record<string, ClassGroup> = {};

    students.forEach((aluno) => {
      const frequentaHoje =
        aluno.diasSemana && aluno.diasSemana.includes(diaFiltro);

      if (frequentaHoje) {
        addToGroup(groups, aluno);
      }
    });

    replacements.forEach((alunoRep) => {
      addToGroup(groups, alunoRep);
    });

    return Object.values(groups).sort((a, b) =>
      a.horario.localeCompare(b.horario),
    );
  }, [students, replacements, diaFiltro]);

  function addToGroup(groups: Record<string, ClassGroup>, aluno: any) {
    const horario = aluno.horarioAula || "Sem Horário";

    if (!groups[horario]) {
      groups[horario] = {
        turma: `Treino das ${horario}`,
        horario: horario,
        totalAlunos: 0,
        alunos: [],
      };
    }

    const exists = groups[horario].alunos.find((a) => a.id === aluno.id);
    if (!exists) {
      groups[horario].alunos.push(aluno);
      groups[horario].totalAlunos++;
    }
  }

  const handleSelectClass = (group: ClassGroup) => {
    setSelectedGroup(group);
    setPresencas({});
    setCurrentView("CHAMADA");
  };

  const handleBackToSelection = () => {
    setSelectedGroup(null);
    setCurrentView("SELECAO");
  };

  const handleMarkPresence = (id: number, status: "presente" | "falta") => {
    setPresencas((prev) => ({ ...prev, [id]: status }));
  };

  const handleFinalizar = async () => {
    if (!selectedGroup) return;

    const registros = selectedGroup.alunos.map((student) => ({
      studentId: student.id!,
      status: presencas[student.id!] || "falta",
    }));

    const dataLocal = new Date()
      .toLocaleDateString("pt-BR")
      .split("/")
      .reverse()
      .join("-");

    const payload = {
      turma: selectedGroup.turma,
      dataAula: dataLocal,
      registros,
    };

    try {
      const response = await AttendanceService.save(payload);
      if (response.success) {
        setShowSuccess(true);
      } else {
        alert("Erro ao salvar: " + response.error);
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-gray-50/30">
      <div className="p-6 border-b border-gray-100 bg-white flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          {currentView === "CHAMADA" && (
            <button
              onClick={handleBackToSelection}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <span className="text-xl">←</span>
            </button>
          )}
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-serif text-gray-800 flex items-center gap-2">
                {currentView === "SELECAO"
                  ? "Turmas do Dia"
                  : `Chamada: ${selectedGroup?.turma}`}

                {currentView === "SELECAO" && (
                  <span className="text-xs font-sans font-normal bg-[#8CAB91]/10 text-[#5A7A60] px-2 py-1 rounded-md border border-[#8CAB91]/20">
                    {getDataExibicao()}
                  </span>
                )}
              </h2>

              <p className="text-sm text-gray-500">
                {currentView === "SELECAO"
                  ? "Selecione uma turma para realizar a chamada."
                  : `${selectedGroup?.horario} • ${selectedGroup?.totalAlunos} Alunos na lista`}
              </p>
            </div>
            {/* Botão de configuração removido daqui */}
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full">
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((dia) => (
            <button
              key={dia}
              onClick={() => {
                setDiaFiltro(dia);
                if (currentView === "CHAMADA") handleBackToSelection();
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                diaFiltro === dia
                  ? "bg-white text-[#2C2C2C] shadow-sm border border-gray-200"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {dia}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto pb-24">
        {loading && (
          <div className="text-center py-10 text-gray-400 animate-pulse">
            Sincronizando dados...
          </div>
        )}

        {!loading && currentView === "SELECAO" && (
          <>
            {turmasDoDia.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center text-2xl grayscale opacity-50">
                  📅
                </div>
                <p>Nenhuma turma encontrada para {diaFiltro}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {turmasDoDia.map((grupo) => {
                  const limite = getLimitForClass(grupo.horario);
                  const isFull = grupo.totalAlunos >= limite;
                  const ocupacao = Math.min(
                    (grupo.totalAlunos / limite) * 100,
                    100,
                  );

                  return (
                    <button
                      key={`${grupo.turma}-${grupo.horario}`}
                      onClick={() => handleSelectClass(grupo)}
                      className="flex flex-col bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#8CAB91]/50 hover:-translate-y-1 transition-all duration-300 text-left group relative overflow-hidden"
                    >
                      <div className="absolute top-4 right-4">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded border ${
                            isFull
                              ? "bg-red-50 text-red-500 border-red-100"
                              : "bg-gray-50 text-gray-500 border-gray-100"
                          }`}
                        >
                          {grupo.totalAlunos} / {limite}
                        </span>
                      </div>

                      <div className="flex justify-between items-start w-full mb-4">
                        <div className="bg-[#8CAB91]/10 text-[#8CAB91] p-3 rounded-xl group-hover:bg-[#8CAB91] group-hover:text-white transition-colors">
                          <Icons.Users />
                        </div>
                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full border border-gray-200 mr-16">
                          {grupo.horario}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {grupo.turma}
                      </h3>

                      {isFull ? (
                        <p className="text-sm text-red-500 font-semibold animate-pulse">
                          ⚠️ Turma Lotada
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          {grupo.totalAlunos} alunos
                        </p>
                      )}

                      <div className="w-full mt-4 h-2 bg-gray-100 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full transition-all duration-700 ease-out ${
                            isFull ? "bg-red-500" : "bg-[#8CAB91]"
                          }`}
                          style={{ width: `${ocupacao}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {!loading && currentView === "CHAMADA" && selectedGroup && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
            {selectedGroup.alunos.map((student) => (
              <CardChamada
                key={student.id}
                student={student}
                status={presencas[student.id!] || "pendente"}
                onMark={handleMarkPresence}
              />
            ))}
          </div>
        )}
      </div>

      {currentView === "CHAMADA" && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
          <button
            onClick={handleFinalizar}
            className="pointer-events-auto bg-[#2C2C2C] text-white px-8 py-4 rounded-full shadow-2xl shadow-black/30 hover:scale-105 active:scale-95 transition-all font-bold tracking-wide flex items-center gap-3 border-4 border-gray-50"
          >
            <Icons.CheckCircle />
            Confirmar Presenças
          </button>
        </div>
      )}

      {showSuccess && (
        <Popup
          onClose={() => {
            setShowSuccess(false);
            handleBackToSelection();
          }}
        >
          <div className="text-center py-6 px-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 animate-bounce-slow">
              <Icons.CheckCircle />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Chamada Finalizada!
            </h2>
            <p className="text-gray-500 mb-2">
              A presença da turma <b>{selectedGroup?.turma}</b> foi salva.
            </p>
            <p className="text-xs text-gray-400 uppercase tracking-widest border-t border-gray-100 pt-2 mt-2">
              Data: {getDataExibicao()}
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                handleBackToSelection();
              }}
              className="mt-6 bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-black transition-colors w-full"
            >
              Fechar
            </button>
          </div>
        </Popup>
      )}
    </div>
  );
}

function CardChamada({
  student,
  status,
  onMark,
}: {
  student: Cadastro & { isReposicao?: boolean };
  status: string;
  onMark: (id: number, s: "presente" | "falta") => void;
}) {
  return (
    <div
      className={`
      relative p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 bg-white
      ${status === "presente" ? "border-[#8CAB91] bg-[#8CAB91]/5 shadow-sm" : ""}
      ${status === "falta" ? "border-red-200 bg-red-50/50" : ""}
      ${status === "pendente" ? "border-gray-100 hover:border-gray-300" : ""}
      ${student.isReposicao ? "ring-2 ring-blue-100 border-blue-200" : ""} 
    `}
    >
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200 text-gray-400 font-bold">
        {student.fotoUrl ? (
          <img
            src={`media://${student.fotoUrl}`}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          student.nome[0]
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4
          className={`font-semibold truncate flex items-center gap-2 ${status === "falta" ? "text-gray-400" : "text-gray-800"}`}
        >
          {student.nome}
        </h4>

        {student.isReposicao && (
          <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-1 inline-block">
            Reposição
          </span>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500">
          {status === "presente" && (
            <span className="text-[#8CAB91] font-bold">Presente</span>
          )}
          {status === "falta" && (
            <span className="text-red-400 font-bold">Falta</span>
          )}
          {status === "pendente" && <span>Pendente</span>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onMark(student.id!, "presente")}
          className={`p-2 rounded-lg transition-all ${status === "presente" ? "bg-[#8CAB91] text-white" : "bg-gray-50 hover:bg-[#8CAB91]/20 text-gray-300 hover:text-[#8CAB91]"}`}
        >
          <Icons.CheckCircle />
        </button>
        <button
          onClick={() => onMark(student.id!, "falta")}
          className={`p-2 rounded-lg transition-all ${status === "falta" ? "bg-red-500 text-white" : "bg-gray-50 hover:bg-red-100 text-gray-300 hover:text-red-500"}`}
        >
          <Icons.XCircle />
        </button>
      </div>
    </div>
  );
}
