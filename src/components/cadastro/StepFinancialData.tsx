// src/components/cadastro/StepFinancialData.tsx
import FormInput from "../common/FormInput";
import { Cadastro } from "../../types/typeCadastro";

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

export default function StepFinancialData({ data, onChange }: Props) {
  const toggleDia = (dia: string) => {
    const atuais = data.diasSemana || [];
    const novos = atuais.includes(dia)
      ? atuais.filter((d) => d !== dia)
      : [...atuais, dia];
    onChange("diasSemana", novos);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <div className="col-span-2">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          Dados Financeiros
        </h3>
        <p className="text-sm text-gray-500">
          Defina a turma e os valores do contrato.
        </p>
      </div>

      <FormInput<Cadastro>
        label="Turma / Série"
        name="turma"
        value={data.turma}
        onChange={onChange}
        autoFocus
        placeholder="Ex: 1º Ano A"
      />
      <FormInput<Cadastro>
        label="Horário Fixo"
        name="horarioAula"
        value={data.horarioAula}
        onChange={onChange}
      />
      <div className="col-span-2">
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
      <FormInput<Cadastro>
        label="Plano Contratado"
        name="planoMensal"
        value={data.planoMensal}
        onChange={onChange}
        placeholder="Ex: Mensal, Semestral"
      />

      <div className="col-span-2 grid grid-cols-2 gap-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
        <FormInput<Cadastro>
          label="Valor Matrícula (R$)"
          name="valorMatricula"
          type="number"
          value={data.valorMatricula}
          onChange={onChange}
        />
        <FormInput<Cadastro>
          label="Valor Mensalidade (R$)"
          name="valorMensalidade"
          type="number"
          value={data.valorMensalidade}
          onChange={onChange}
        />
      </div>

      <FormInput<Cadastro>
        label="Forma de Pagamento"
        name="formaPagamento"
        type="select"
        value={data.formaPagamento}
        options={[
          { value: "PIX", label: "💠 PIX" },
          { value: "BOLETO", label: "📄 Boleto Bancário" },
          { value: "CARTAO", label: "💳 Cartão de Crédito" },
          { value: "DINHEIRO", label: "💵 Dinheiro" },
        ]}
        onChange={onChange}
      />

      <FormInput<Cadastro>
        label="Dia de Vencimento"
        name="diaVencimento"
        type="number"
        value={data.diaVencimento}
        onChange={onChange}
        placeholder="Ex: 10"
      />
    </div>
  );
}
