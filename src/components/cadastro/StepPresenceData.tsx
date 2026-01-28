import { useEffect, useState } from "react";
import { Cadastro, DiaConfig } from "../../types/typeCadastro";
import { NOME_PADRAO, OPCOES_HORARIOS } from "../../utils/options";
import { ConfigService } from "../../services/ConfigService";
import { Icons } from "../common/Icons"; // Assumindo que você tem ícones, ou use texto

interface Props {
  data: Cadastro;
  onChange: (name: keyof Cadastro, value: any) => void;
}

const DIAS_OPCOES = [
  { value: "Seg", label: "Segunda" },
  { value: "Ter", label: "Terça" },
  { value: "Qua", label: "Quarta" },
  { value: "Qui", label: "Quinta" },
  { value: "Sex", label: "Sexta" },
  { value: "Sab", label: "Sábado" },
];

export default function StepPresenceData({ data, onChange }: Props) {
  const [availableTimes, setAvailableTimes] =
    useState<string[]>(OPCOES_HORARIOS);

  useEffect(() => {
    if (data.turma !== NOME_PADRAO) {
      onChange("turma", NOME_PADRAO);
    }
    loadDynamicSchedules();
  }, []);

  const loadDynamicSchedules = async () => {
    try {
      const limits = await ConfigService.getLimits();
      const dbTimes = Object.keys(limits);
      if (dbTimes.length > 0) {
        setAvailableTimes(dbTimes.sort());
      }
    } catch (error) {
      console.error("Erro ao carregar horários:", error);
    }
  };

  // Verifica se o dia está selecionado e retorna o objeto dele
  const getDiaConfig = (diaSigla: string) => {
    // Garante que é um array para evitar erro de .find
    const lista = Array.isArray(data.diasSemana) ? data.diasSemana : [];
    return lista.find((d: any) => d.dia === diaSigla); // d.dia ou d se for string antiga
  };

  const handleToggleDia = (diaSigla: string) => {
    let novosDias: DiaConfig[] = [...((data.diasSemana as any[]) || [])];
    const exists = novosDias.find((d) => d.dia === diaSigla);

    if (exists) {
      // Se já existe, remove (desmarca)
      novosDias = novosDias.filter((d) => d.dia !== diaSigla);
    } else {
      // Se não existe, adiciona com o primeiro horário disponível
      novosDias.push({ dia: diaSigla, horario: availableTimes[0] || "08:00" });
    }

    onChange("diasSemana", novosDias);

    // Atualiza o "horarioAula" principal apenas para referência visual no banco
    if (novosDias.length > 0) {
      // Se todos os horários forem iguais, usa ele, senão usa "Vários"
      const primeiroHorario = novosDias[0].horario;
      const todosIguais = novosDias.every((d) => d.horario === primeiroHorario);
      onChange("horarioAula", todosIguais ? primeiroHorario : "Vários");
    } else {
      onChange("horarioAula", "");
    }
  };

  const handleChangeHorario = (diaSigla: string, novoHorario: string) => {
    const novosDias = (data.diasSemana as any[]).map((d) => {
      if (d.dia === diaSigla) {
        return { ...d, horario: novoHorario };
      }
      return d;
    });
    onChange("diasSemana", novosDias);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          Dias e Horários
        </h3>
        <p className="text-sm text-gray-500">
          Selecione os dias e defina o horário para cada um.
        </p>
      </div>

      {/* 1. Seleção de Dias (Botões) */}
      <div className="flex gap-2 flex-wrap">
        {DIAS_OPCOES.map((option) => {
          const isSelected = !!getDiaConfig(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggleDia(option.value)}
              className={`px-4 py-3 rounded-lg text-sm font-bold transition-all border ${
                isSelected
                  ? "bg-[#8CAB91] text-white border-[#8CAB91] shadow-md transform scale-105"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {option.value}
            </button>
          );
        })}
      </div>

      {/* 2. Configuração de Horários (Lista dinâmica) */}
      <div className="space-y-3 mt-2">
        {((data.diasSemana as any[]) || []).length === 0 && (
          <p className="text-sm text-gray-400 italic">
            Nenhum dia selecionado.
          </p>
        )}

        {((data.diasSemana as any[]) || [])
          .sort((a, b) => {
            // Ordenar dias na ordem correta (Seg, Ter, Qua...)
            const ordem = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
            return ordem.indexOf(a.dia) - ordem.indexOf(b.dia);
          })
          .map((config) => (
            <div
              key={config.dia}
              className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[#8CAB91]/10 text-[#5A7A60] flex items-center justify-center font-bold text-sm">
                  {config.dia}
                </span>
                <span className="font-medium text-gray-700">
                  {DIAS_OPCOES.find((d) => d.value === config.dia)?.label}
                </span>
              </div>

              <select
                value={config.horario}
                onChange={(e) =>
                  handleChangeHorario(config.dia, e.target.value)
                }
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#8CAB91] focus:border-[#8CAB91] block p-2.5 w-32"
              >
                {availableTimes.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>
            </div>
          ))}
      </div>
    </div>
  );
}
