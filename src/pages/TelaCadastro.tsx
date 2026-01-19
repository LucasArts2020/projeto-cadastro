import { useState } from "react";
import { Cadastro } from "../types/typeCadastro";
import { CadastroService } from "../services/CadastroService";
import Popup from "../components/layout/popup";

import Stepper from "../components/common/Stepper";
import StepPersonalData from "../components/cadastro/StepPersonalData";
import StepFinancialData from "../components/cadastro/StepFinancialData";
import StepPresenceData from "../components/cadastro/StepPresenceData"; // Importe o novo step
import FormActions from "../components/cadastro/FormActions";

interface Props {
  onSuccess?: () => void;
}

interface PopupState {
  open: boolean;
  key: number;
}

export default function TelaCadastro({ onSuccess }: Props) {
  const [etapa, setEtapa] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState<PopupState>({
    open: false,
    key: 0,
  });

  const [cadastroDados, setCadastroDados] = useState<Cadastro>({
    nome: "",
    rg: "",
    cpf: "",
    dataNascimento: "",
    telefone: "",
    telefone2: "",
    endereco: "",
    fotoFile: null,
    turma: "",
    valorMatricula: 0,
    planoMensal: "",
    valorMensalidade: 0,
    formaPagamento: "",
    diaVencimento: "",
    diasSemana: [],
    horarioAula: "",
  });

  function handleChange(name: keyof Cadastro, value: any) {
    setCadastroDados((prev) => ({
      ...prev,
      [name]: value,
      ...(value instanceof File && { fotoFile: value }),
    }));
  }

  // Controle de validação e avanço de etapas
  const proximaEtapa = () => {
    // Validação Passo 1
    if (etapa === 1) {
      if (!cadastroDados.nome || !cadastroDados.cpf) {
        setShowPopup({ open: true, key: 1 });
        return;
      }
      setEtapa(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Validação Passo 2 (Opcional: Exigir Turma?)
    if (etapa === 2) {
      if (!cadastroDados.turma) {
        // Se quiser obrigar a ter turma, descomente abaixo ou crie um popup novo
        // alert("Preencha a turma!");
        // return;
      }
      setEtapa(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const etapaAnterior = () => {
    setEtapa((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function salvar() {
    setIsLoading(true);
    try {
      await CadastroService.create(cadastroDados);

      setTimeout(() => {
        setShowPopup({ open: true, key: 2 });
        // Reset total
        setCadastroDados({
          nome: "",
          rg: "",
          cpf: "",
          dataNascimento: "",
          telefone: "",
          telefone2: "",
          endereco: "",
          fotoFile: null,
          turma: "",
          valorMatricula: 0,
          planoMensal: "",
          valorMensalidade: 0,
          formaPagamento: "",
          diaVencimento: "",
          diasSemana: [],
          horarioAula: "",
        });
        setEtapa(1);
        setIsLoading(false);
        if (onSuccess) onSuccess();
      }, 500);
    } catch (error) {
      setShowPopup({ open: true, key: 3 });
    } finally {
      setIsLoading(false);
    }
  }

  // Renderização condicional dos Steps
  const renderStep = () => {
    switch (etapa) {
      case 1:
        return (
          <StepPersonalData data={cadastroDados} onChange={handleChange} />
        );
      case 2:
        return (
          <StepPresenceData data={cadastroDados} onChange={handleChange} />
        );
      case 3:
        return (
          <StepFinancialData data={cadastroDados} onChange={handleChange} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Stepper currentStep={etapa} />

      <div className="p-8 bg-white min-h-100">{renderStep()}</div>

      {/* Popups (Mantidos iguais) */}
      <div>
        {showPopup.open && showPopup.key === 1 && (
          <Popup onClose={() => setShowPopup({ open: false, key: 0 })}>
            <h2 className="text-lg font-semibold mb-2">
              Preencha os dados pessoais
            </h2>
            <p className="text-sm text-gray-500">
              Nome e CPF são obrigatórios.
            </p>
          </Popup>
        )}
        {showPopup.open && showPopup.key === 2 && (
          <Popup onClose={() => setShowPopup({ open: false, key: 0 })}>
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2 text-green-600">
                Sucesso!
              </h2>
              <p className="text-gray-600">Aluno cadastrado corretamente.</p>
            </div>
          </Popup>
        )}
        {showPopup.open && showPopup.key === 3 && (
          <Popup onClose={() => setShowPopup({ open: false, key: 0 })}>
            <h2 className="text-lg font-semibold mb-2 text-red-600">Erro</h2>
            <p className="text-sm text-gray-500">Não foi possível salvar.</p>
          </Popup>
        )}
      </div>

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
