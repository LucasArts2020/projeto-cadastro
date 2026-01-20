import { useState } from "react";
import { Cadastro } from "../../types/typeCadastro";
import { CadastroService } from "../../services/CadastroService";

import Stepper from "../common/Stepper";
import StepPersonalData from "../cadastro/StepPersonalData";
import StepFinancialData from "../cadastro/StepFinancialData";
import StepPresenceData from "../cadastro/StepPresenceData";
import FormActions from "../cadastro/FormActions";

interface Props {
  student: Cadastro;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditarAluno({
  student,
  onClose,
  onSuccess,
}: Props) {
  const [etapa, setEtapa] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Inicializa o estado com os dados do aluno recebido
  const [dados, setDados] = useState<Cadastro>({ ...student });

  function handleChange(name: keyof Cadastro, value: any) {
    setDados((prev) => ({
      ...prev,
      [name]: value,
      ...(value instanceof File && { fotoFile: value }), // Atualiza arquivo se houver
    }));
  }

  const proximaEtapa = () => setEtapa((prev) => prev + 1);
  const etapaAnterior = () => setEtapa((prev) => prev - 1);

  async function salvar() {
    setIsLoading(true);
    try {
      // Chama o update ao invés do create
      await CadastroService.update(dados);
      onSuccess(); // Recarrega a lista na tela pai
      onClose(); // Fecha o modal
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao salvar alterações.");
    } finally {
      setIsLoading(false);
    }
  }

  const renderStep = () => {
    switch (etapa) {
      case 1:
        return <StepPersonalData data={dados} onChange={handleChange} />;
      case 2:
        return <StepPresenceData data={dados} onChange={handleChange} />;
      case 3:
        return <StepFinancialData data={dados} onChange={handleChange} />;
      default:
        return null;
    }
  };

  return (
    // Overlay Escuro
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      {/* Container do Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div>
            <h2 className="text-lg font-bold text-stone-700">Editar Aluno</h2>
            <p className="text-xs text-stone-400">
              ID: {dados.id} - {dados.nome}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
          >
            {/* Usando um X simples ou Ícone se tiver */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Stepper (Visualização das Etapas) */}
        <div className="px-6 pt-4">
          <Stepper currentStep={etapa} />
        </div>

        {/* Conteúdo do Formulário (Scrollável) */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {renderStep()}
        </div>

        {/* Rodapé com Ações */}
        <div className="p-4 border-t border-stone-100 bg-stone-50">
          <FormActions
            step={etapa}
            isLoading={isLoading}
            onBack={etapaAnterior}
            onNext={proximaEtapa}
            onSave={salvar}
          />
        </div>
      </div>
    </div>
  );
}
