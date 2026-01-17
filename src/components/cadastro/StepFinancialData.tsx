// src/components/cadastro/StepFinancialData.tsx
import FormInput from "../common/FormInput";
import { Cadastro } from "../../types/typeCadastro";

interface Props {
  data: Cadastro;
  onChange: (name: keyof Cadastro, value: any) => void;
}

export default function StepFinancialData({ data, onChange }: Props) {
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
