import { useState } from "react";
import { Cadastro } from "../types/typeCadastro";
import { CadastroService } from "../services/CadastroService";

// Novos Componentes
import Stepper from "../components/common/Stepper";
import StepPersonalData from "../components/cadastro/StepPersonalData";
import StepFinancialData from "../components/cadastro/StepFinancialData";
import FormActions from "../components/cadastro/FormActions";

interface Props {
  onSuccess?: () => void;
}

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
        // Reset
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

  return (
    <div className="flex flex-col h-full">
      {/* 1. Indicador de Progresso */}
      <Stepper currentStep={etapa} />

      {/* 2. Conteúdo do Formulário (Renderização Condicional) */}
      <div className="p-8 bg-white min-h-[400px]">
        {etapa === 1 ? (
          <StepPersonalData data={cadastroDados} onChange={handleChange} />
        ) : (
          <StepFinancialData data={cadastroDados} onChange={handleChange} />
        )}
      </div>

      {/* 3. Botões de Ação */}
      <FormActions
        step={etapa}
        isLoading={isLoading}
        onBack={etapaAnterior}
        onNext={proximaEtapa}
        onSave={salvar}
      />
    </div>
  );
}
