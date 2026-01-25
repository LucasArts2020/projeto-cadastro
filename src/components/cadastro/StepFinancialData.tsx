import FormInput from "../common/FormInput";
import { Cadastro } from "../../types/typeCadastro";
import { OPCOES_PLANOS } from "../../utils/options";

interface Props {
  data: Cadastro;
  onChange: (name: keyof Cadastro, value: any) => void;
}

export default function StepFinancialData({ data, onChange }: Props) {
  const handleMoneyChange = (name: keyof Cadastro, value: string) => {
    const cleanValue = value.replace(/\D/g, "");

    const numberValue = Number(cleanValue) / 100;
    onChange(name, numberValue);
  };

  const formatMoney = (value: number) => {
    if (value === undefined || value === null) return "";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleDayChange = (name: keyof Cadastro, value: number) => {
    let day = value;
    if (day < 1) day = 1;
    if (day > 31) day = 31;
    onChange(name, day);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <div className="col-span-2">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          Dados Financeiros
        </h3>
        <p className="text-sm text-gray-500">
          Defina o plano contratado e as formas de pagamento.
        </p>
      </div>

      <FormInput<Cadastro>
        label="Plano Contratado"
        name="planoMensal"
        type="select"
        value={data.planoMensal}
        options={OPCOES_PLANOS}
        onChange={onChange}
        autoFocus
      />

      <FormInput<Cadastro>
        label="Dia de Vencimento"
        name="diaVencimento"
        type="number"
        value={data.diaVencimento}
        onChange={(name, val) => handleDayChange(name, Number(val))}
        placeholder="Ex: 10"
        min={1}
        max={31}
      />

      <div className="col-span-2 grid grid-cols-2 gap-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
        <FormInput<Cadastro>
          label="Valor Matrícula"
          name="valorMatricula"
          type="text"
          value={formatMoney(data.valorMatricula) as any}
          onChange={(name, val) => handleMoneyChange(name, String(val))}
          placeholder="R$ 0,00"
        />
        <FormInput<Cadastro>
          label="Valor Mensalidade"
          name="valorMensalidade"
          type="text" // Usamos text para permitir a formatação R$
          value={formatMoney(data.valorMensalidade) as any}
          onChange={(name, val) => handleMoneyChange(name, String(val))}
          placeholder="R$ 0,00"
        />
      </div>

      <div className="col-span-2">
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
      </div>
    </div>
  );
}
