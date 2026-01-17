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

interface Popup {
  open: boolean;
  key: number;
}

export default function TelaCadastro({ onSuccess }: Props) {
  const [etapa, setEtapa] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState<Popup>({ open: false, key: 0 });

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
      <div>
        {showPopup.open && showPopup.key === 1 && (
          <Popup onClose={() => setShowPopup({ open: false, key: 0 })}>
            <h2 className="text-lg font-semibold mb-2">Preencha os campos</h2>
          </Popup>
        )}
        {showPopup.open && showPopup.key === 2 && (
          <Popup onClose={() => setShowPopup({ open: false, key: 0 })}>
            <h2 className="text-lg font-semibold mb-2">
              Aluno cadastrado com sucesso
            </h2>
          </Popup>
        )}
        {showPopup.open && showPopup.key === 3 && (
          <Popup onClose={() => setShowPopup({ open: false, key: 0 })}>
            <h2 className="text-lg font-semibold mb-2">Erro ao cadastrar</h2>
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
