import { useEffect, useState } from "react";
import FormInput from "../common/FormInput";
import { Cadastro } from "../../types/typeCadastro";
import { NOME_PADRAO, OPCOES_HORARIOS } from "../../utils/options"; // Mantém como fallback
import { ConfigService } from "../../services/ConfigService"; // Importe o serviço

interface Props {
  data: Cadastro;
  onChange: (name: keyof Cadastro, value: any) => void;
}

const DIAS_OPCOES = [
  { value: "Seg", label: "Seg" },
  { value: "Ter", label: "Ter" },
  { value: "Qua", label: "Qua" },
  { value: "Qui", label: "Qui" },
  { value: "Sex", label: "Sex" },
  { value: "Sab", label: "Sáb" },
];

export default function StepPresenceData({ data, onChange }: Props) {
  // Estado local para guardar os horários (inicia com o padrão, mas será atualizado)
  const [schedules, setSchedules] = useState(
    OPCOES_HORARIOS.map((h) => ({ label: h, value: h })),
  );

  useEffect(() => {
    if (data.turma !== NOME_PADRAO) {
      onChange("turma", NOME_PADRAO);
    }

    // Carrega os horários configurados no banco
    loadDynamicSchedules();
  }, []);

  const loadDynamicSchedules = async () => {
    try {
      // Busca os limites salvos no banco
      const limits = await ConfigService.getLimits();
      const dbTimes = Object.keys(limits);

      // Se houver horários configurados no banco, usa eles
      if (dbTimes.length > 0) {
        const sortedTimes = dbTimes.sort(); // Ordena (06:00, 07:00...)
        setSchedules(sortedTimes.map((h) => ({ label: h, value: h })));
      }
    } catch (error) {
      console.error("Erro ao carregar horários dinâmicos:", error);
    }
  };

  const toggleDia = (dia: string) => {
    const atuais = data.diasSemana || [];
    const novos = atuais.includes(dia)
      ? atuais.filter((d) => d !== dia)
      : [...atuais, dia];
    onChange("diasSemana", novos);
  };

  return (
    <div className="grid grid-cols-1 gap-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          Horário de Treino
        </h3>
        <p className="text-sm text-gray-500">
          Defina o horário fixo e os dias da semana do aluno.
        </p>
      </div>

      <FormInput<Cadastro>
        label="Horário Fixo"
        name="horarioAula"
        type="select"
        options={schedules} // Agora usa a lista dinâmica
        value={data.horarioAula}
        onChange={onChange}
        autoFocus
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dias de Frequência
        </label>
        <div className="flex gap-2 flex-wrap">
          {DIAS_OPCOES.map((dia) => {
            const isSelected = (data.diasSemana || []).includes(dia.value);
            return (
              <button
                key={dia.value}
                type="button"
                onClick={() => toggleDia(dia.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  isSelected
                    ? "bg-[#8CAB91] text-white border-[#8CAB91] shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {dia.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
