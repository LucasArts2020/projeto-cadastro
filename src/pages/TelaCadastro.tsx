import { useState } from "react";
import FormInput from "../components/FormInput";
import { Cadastro } from "../types/typeCadastro";
import { CadastroService } from "../services/CadastroService";

interface Props {
  onSuccess?: () => void;
}

const CheckIcon = () => (
  <svg
    className="w-5 h-5 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function TelaCadastro({ onSuccess }: Props) {
  const [etapa, setEtapa] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [cadastroDados, setCadastroDados] = useState<Cadastro>({
    nome: "",
    rg: "",
    cpf: "",
    dataNascimento: "",
    telefone: "",
    telefone2: "",
    endereco: "",
    fotoUrl: null,
    turma: "",
    valorMatricula: 0,
    planoMensal: "",
    valorMensalidade: 0,
    formaPagamento: "",
    diaVencimento: "",
  });

  function handleChange(name: keyof Cadastro, value: any) {
    setCadastroDados((prev) => ({ ...prev, [name]: value }));
  }

  const proximaEtapa = () => {
    if (!cadastroDados.nome || !cadastroDados.cpf) {
      alert("⚠️ Preencha Nome e CPF para continuar.");
      return;
    }
    setEtapa(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const etapaAnterior = () => {
    setEtapa(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function salvar() {
    setIsLoading(true);
    try {
      await CadastroService.create(cadastroDados);
      setTimeout(() => {
        alert("✅ Aluno matriculado com sucesso!");
        setCadastroDados({
          nome: "",
          rg: "",
          cpf: "",
          dataNascimento: "",
          telefone: "",
          telefone2: "",
          endereco: "",
          fotoUrl: null,
          turma: "",
          valorMatricula: 0,
          planoMensal: "",
          valorMensalidade: 0,
          formaPagamento: "",
          diaVencimento: "",
        });
        setEtapa(1);
        setIsLoading(false);
        if (onSuccess) onSuccess();
      }, 500);
    } catch (error) {
      console.error(error);
      alert("❌ Erro ao salvar cadastro.");
      setIsLoading(false);
    }
  }

  // Componente de Passo (Com cores Tailwind Padrão)
  const StepIndicator = ({
    num,
    title,
    current,
  }: {
    num: number;
    title: string;
    current: number;
  }) => {
    const isActive = current === num;
    const isCompleted = current > num;

    return (
      <div className="flex flex-col items-center relative z-10">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
            isActive
              ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-300 scale-110"
              : isCompleted
                ? "bg-emerald-500 border-emerald-500"
                : "bg-white border-gray-300 text-gray-400"
          }`}
        >
          {isCompleted ? (
            <CheckIcon />
          ) : (
            <span className={`font-bold ${isActive ? "text-white" : ""}`}>
              {num}
            </span>
          )}
        </div>
        <span
          className={`mt-2 text-xs font-bold uppercase tracking-wider ${isActive ? "text-indigo-700" : isCompleted ? "text-emerald-600" : "text-gray-400"}`}
        >
          {title}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header do Wizard */}
      <div className="bg-gray-50 px-8 py-8 border-b border-gray-100 flex justify-center relative">
        <div className="absolute top-12 left-1/4 right-1/4 h-1 bg-gray-200 -z-0 rounded"></div>
        <div
          className={`absolute top-12 left-1/4 h-1 bg-emerald-500 -z-0 rounded transition-all duration-500 ${etapa === 2 ? "w-1/2" : "w-0"}`}
        ></div>

        <div className="flex justify-between w-full max-w-md">
          <StepIndicator num={1} title="Dados Pessoais" current={etapa} />
          <StepIndicator num={2} title="Matrícula" current={etapa} />
        </div>
      </div>

      {/* Corpo */}
      <div className="p-8 bg-white min-h-[400px]">
        <div className="space-y-6">
          {etapa === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  Quem é o aluno?
                </h3>
                <p className="text-sm text-gray-500">
                  Preencha os dados de identificação.
                </p>
              </div>

              <FormInput<Cadastro>
                label="Nome Completo"
                name="nome"
                value={cadastroDados.nome}
                onChange={handleChange}
                className="col-span-2"
                autoFocus
                placeholder="Ex: João da Silva"
              />
              <FormInput<Cadastro>
                label="CPF"
                name="cpf"
                value={cadastroDados.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
              />
              <FormInput<Cadastro>
                label="RG"
                name="rg"
                value={cadastroDados.rg}
                onChange={handleChange}
              />
              <FormInput<Cadastro>
                label="Data de Nascimento"
                name="dataNascimento"
                type="date"
                value={cadastroDados.dataNascimento}
                onChange={handleChange}
              />
              <FormInput<Cadastro>
                label="Telefone / WhatsApp"
                name="telefone"
                value={cadastroDados.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
              <FormInput<Cadastro>
                label="Telefone Recado"
                name="telefone2"
                value={cadastroDados.telefone2}
                onChange={handleChange}
                placeholder="(00) 0000-0000"
              />
              <FormInput<Cadastro>
                label="Endereço Completo"
                name="endereco"
                value={cadastroDados.endereco}
                onChange={handleChange}
                className="col-span-2"
                placeholder="Rua, Número, Bairro"
              />

              <div className="col-span-2 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-4">
                <div className="bg-indigo-200 p-2 rounded-full text-indigo-700">
                  📷
                </div>
                <FormInput<Cadastro>
                  label="Foto do Perfil (Opcional)"
                  name="fotoUrl"
                  type="file"
                  onChange={handleChange}
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {etapa === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                value={cadastroDados.turma}
                onChange={handleChange}
                autoFocus
                placeholder="Ex: 1º Ano A"
              />
              <FormInput<Cadastro>
                label="Plano Contratado"
                name="planoMensal"
                value={cadastroDados.planoMensal}
                onChange={handleChange}
                placeholder="Ex: Mensal, Semestral"
              />

              <div className="col-span-2 grid grid-cols-2 gap-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
                <FormInput<Cadastro>
                  label="Valor Matrícula (R$)"
                  name="valorMatricula"
                  type="number"
                  value={cadastroDados.valorMatricula}
                  onChange={handleChange}
                />
                <FormInput<Cadastro>
                  label="Valor Mensalidade (R$)"
                  name="valorMensalidade"
                  type="number"
                  value={cadastroDados.valorMensalidade}
                  onChange={handleChange}
                />
              </div>

              <FormInput<Cadastro>
                label="Forma de Pagamento"
                name="formaPagamento"
                type="select"
                value={cadastroDados.formaPagamento}
                options={[
                  { value: "PIX", label: "💠 PIX" },
                  { value: "BOLETO", label: "📄 Boleto Bancário" },
                  { value: "CARTAO", label: "💳 Cartão de Crédito" },
                  { value: "DINHEIRO", label: "💵 Dinheiro" },
                ]}
                onChange={handleChange}
              />

              <FormInput<Cadastro>
                label="Dia de Vencimento"
                name="diaVencimento"
                type="number"
                value={cadastroDados.diaVencimento}
                onChange={handleChange}
                placeholder="Ex: 10"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-between items-center mt-auto">
        {etapa === 2 ? (
          <button
            onClick={etapaAnterior}
            className="text-gray-600 font-semibold hover:text-gray-900 transition flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer"
          >
            ← Voltar
          </button>
        ) : (
          <div />
        )}

        {etapa === 1 ? (
          <button
            onClick={proximaEtapa}
            className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            Continuar
            <span>→</span>
          </button>
        ) : (
          <button
            onClick={salvar}
            disabled={isLoading}
            className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Salvando..." : "✅ Confirmar Matrícula"}
          </button>
        )}
      </div>
    </div>
  );
}
