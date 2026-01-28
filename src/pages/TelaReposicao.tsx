// src/pages/TelaReposicao.tsx
import { useState, useEffect } from "react";
import { ReposicaoService } from "../services/ReposicaoService";
import { Icons } from "../components/common/Icons";
import Popup from "../components/layout/popup";

export default function TelaReposicao() {
  const [absences, setAbsences] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [targetDate, setTargetDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadAbsences();
  }, []);

  useEffect(() => {
    if (targetDate) loadSlots();
  }, [targetDate]);

  const loadAbsences = async () => {
    const list = await ReposicaoService.getAbsences();
    setAbsences(list);
  };

  const loadSlots = async () => {
    setLoadingSlots(true);
    const dateObj = new Date(targetDate + "T12:00:00");
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    const diaSemana = dias[dateObj.getDay()];
    const availability = await ReposicaoService.checkAvailability(
      targetDate,
      diaSemana,
    );
    setSlots(availability);
    setLoadingSlots(false);
  };

  const handleAgendar = async (slot: any) => {
    if (!selectedStudent) return;

    // Confirmação
    const confirm = window.confirm(
      `Agendar reposição para ${selectedStudent.nome} no dia ${targetDate} às ${slot.horario}?`,
    );

    if (confirm) {
      const res = await ReposicaoService.schedule({
        student_id: selectedStudent.student_id,
        attendance_id: selectedStudent.attendance_id, // Passando o ID da falta
        data_reposicao: targetDate,
        horario: slot.horario,
      });

      if (res.success) {
        setSuccessMsg(`Agendado com sucesso!`);
        setSelectedStudent(null);
        loadAbsences(); // Recarrega a lista para mostrar como concluído
        loadSlots();
      } else {
        alert("Erro ao agendar");
      }
    }
  };

  return (
    <div className="flex h-full bg-gray-50/30 gap-6 p-6">
      {/* LISTA DE FALTAS */}
      <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <Icons.Users /> Alunos para Repor
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Selecione um aluno para ver vagas
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {absences.length === 0 ? (
            <div className="text-center p-8 text-gray-400 text-sm">
              Nenhuma falta recente.
            </div>
          ) : (
            absences.map((item) => {
              // Verifica se já tem reposição agendada (vem do SQL)
              const isScheduled = !!item.replacement_id;

              return (
                <button
                  key={item.attendance_id}
                  disabled={isScheduled} // Bloqueia clique se já agendou
                  onClick={() => setSelectedStudent(item)}
                  className={`w-full text-left p-3 rounded-xl mb-2 transition-all border relative overflow-hidden
                    ${
                      isScheduled
                        ? "bg-gray-50 border-gray-100 opacity-70 cursor-default"
                        : selectedStudent?.attendance_id === item.attendance_id
                          ? "bg-[#8CAB91]/10 border-[#8CAB91] ring-1 ring-[#8CAB91]"
                          : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="font-bold text-gray-800 flex justify-between items-center">
                    {item.nome}
                    {isScheduled && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase font-bold">
                        Agendado
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between mt-1 text-xs">
                    <span className="text-gray-500">{item.turma}</span>
                    <span className="text-red-400 font-medium">
                      Falta: {item.data_aula?.split("-").reverse().join("/")}
                    </span>
                  </div>

                  {isScheduled && item.data_agendada && (
                    <div className="mt-2 text-[10px] text-gray-400 border-t border-gray-200 pt-1 flex items-center gap-1">
                      <Icons.CheckCircle className="w-3 h-3" />
                      Reposição dia{" "}
                      {item.data_agendada.split("-").reverse().join("/")}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* CALENDÁRIO (Direita) - Mantido igual, apenas lógica de disabled */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <label className="font-bold text-gray-700">Data da Reposição:</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="border p-2 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#8CAB91]"
          />
          <span className="text-sm text-gray-500 ml-auto">
            {new Date(targetDate + "T12:00:00").toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h3 className="font-bold text-gray-700 mb-4">Horários Disponíveis</h3>

          {loadingSlots ? (
            <div className="text-gray-400 animate-pulse">
              Verificando vagas...
            </div>
          ) : !selectedStudent ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
              <p>👈 Selecione um aluno à esquerda para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot) => (
                <button
                  key={slot.horario}
                  disabled={slot.vagas <= 0}
                  onClick={() => handleAgendar(slot)}
                  className={`
                    relative p-4 rounded-xl border flex flex-col gap-2 transition-all group
                    ${
                      slot.vagas > 0
                        ? "bg-white hover:shadow-md hover:-translate-y-1 cursor-pointer border-gray-200"
                        : "bg-gray-100 border-gray-100 opacity-60 cursor-not-allowed"
                    }
                  `}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-lg font-bold text-gray-700">
                      {slot.horario}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        slot.vagas > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {slot.vagas > 0 ? `${slot.vagas} Vagas` : "Lotado"}
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${slot.vagas === 0 ? "bg-red-400" : "bg-[#8CAB91]"}`}
                      style={{
                        width: `${(slot.ocupados / slot.limite) * 100}%`,
                      }}
                    />
                  </div>

                  {slot.vagas > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#8CAB91]/95 text-white font-bold opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-300 transform scale-95 group-hover:scale-100">
                      Agendar Reposição
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {successMsg && (
        <Popup onClose={() => setSuccessMsg("")}>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl animate-bounce-slow">
              <Icons.CheckCircle />
            </div>
            <h3 className="text-xl font-bold mb-2">Sucesso!</h3>
            <p className="text-gray-600">{successMsg}</p>
            <button
              onClick={() => setSuccessMsg("")}
              className="mt-4 bg-gray-800 text-white px-6 py-2 rounded-lg w-full hover:bg-black transition-colors"
            >
              OK
            </button>
          </div>
        </Popup>
      )}
    </div>
  );
}
