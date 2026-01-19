import { useEffect } from "react"; // <--- Importe o useEffect
import FormInput from "../common/FormInput";
import { Cadastro } from "../../types/typeCadastro";
import { OPCOES_HORARIOS, NOME_PADRAO } from "../../utils/options";

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
  const opcoesHorarios = OPCOES_HORARIOS.map((h) => ({ label: h, value: h }));

  // --- AUTOMATIZAÇÃO ---
  // Define a turma automaticamente como "Treino" (ou o nome padrão)
  // assim que entra nessa tela, para o banco não dar erro.
  useEffect(() => {
    if (data.turma !== NOME_PADRAO) {
      onChange("turma", NOME_PADRAO);
    }
  }, []);

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

      {/* REMOVEMOS O INPUT DE TURMA DAQUI */}

      {/* Ficou apenas o Horário */}
      <FormInput<Cadastro>
        label="Horário Fixo"
        name="horarioAula"
        type="select"
        options={opcoesHorarios}
        value={data.horarioAula}
        onChange={onChange}
        autoFocus
      />

      {/* Seleção de Dias */}
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
