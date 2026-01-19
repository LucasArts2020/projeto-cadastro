import { useState } from "react";
import { Cadastro } from "../types/typeCadastro";
import { CadastroService } from "../services/CadastroService";
import Popup from "../components/layout/popup";

import Stepper from "../components/common/Stepper";
import StepPersonalData from "../components/cadastro/StepPersonalData";
import StepFinancialData from "../components/cadastro/StepFinancialData";
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

  // 1. INICIALIZAÇÃO DO ESTADO COM OS NOVOS CAMPOS
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
    diasSemana: [], // Novo: Array vazio
    horarioAula: "", // Novo: String vazia
  });

  function handleChange(name: keyof Cadastro, value: any) {
    setCadastroDados((prev) => ({
      ...prev,
      [name]: value,
      ...(value instanceof File && { fotoFile: value }),
    }));
  }

  const proximaEtapa = () => {
    if (!cadastroDados.nome || !cadastroDados.cpf) {
      setShowPopup({ open: true, key: 1 });
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
        setShowPopup({ open: true, key: 2 });

        // 2. RESET DO FORMULÁRIO APÓS SUCESSO
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
          diasSemana: [], // Resetar dias
          horarioAula: "", // Resetar horário
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

  return (
    <div className="flex flex-col h-full">
      <Stepper currentStep={etapa} />

      <div className="p-8 bg-white min-h-100">
        {etapa === 1 ? (
          <StepPersonalData data={cadastroDados} onChange={handleChange} />
        ) : (
          <StepFinancialData data={cadastroDados} onChange={handleChange} />
        )}
      </div>

      {/* Área de Popups */}
      <div>
        {showPopup.open && showPopup.key === 1 && (
          <Popup onClose={() => setShowPopup({ open: false, key: 0 })}>
            <h2 className="text-lg font-semibold mb-2">
              Preencha os campos obrigatórios
            </h2>
            <p className="text-sm text-gray-500">
              Nome e CPF são necessários para avançar.
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
            <p className="text-sm text-gray-500">
              Não foi possível salvar o cadastro.
            </p>
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
