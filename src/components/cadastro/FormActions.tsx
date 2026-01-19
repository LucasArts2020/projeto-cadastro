interface Props {
  step: number;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
}

export default function FormActions({
  step,
  isLoading,
  onBack,
  onNext,
  onSave,
}: Props) {
  // Define qual é a última etapa
  const FINAL_STEP = 3;

  return (
    <div className="px-8 py-5 bg-stone-50 border-t border-stone-200 flex justify-between items-center mt-auto">
      {/* Botão Voltar: Aparece se step for maior que 1 (etapas 2 e 3) */}
      {step > 1 ? (
        <button
          onClick={onBack}
          className="text-stone-500 font-medium hover:text-[#8CAB91] transition flex items-center gap-2 px-4 py-2 uppercase tracking-wide text-sm cursor-pointer"
        >
          ← Voltar
        </button>
      ) : (
        <div /> // Div vazio para manter o layout justificado
      )}

      {/* Botão de Ação Principal */}
      {step < FINAL_STEP ? (
        // Se NÃO for a última etapa, mostra CONTINUAR
        <button
          onClick={onNext}
          className="bg-[#8CAB91] text-white font-medium py-3 px-8 shadow-lg shadow-[#8CAB91]/30 hover:bg-[#7A987F] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 cursor-pointer uppercase tracking-widest text-sm"
        >
          Continuar <span>→</span>
        </button>
      ) : (
        // Se FOR a última etapa, mostra FINALIZAR
        <button
          onClick={onSave}
          disabled={isLoading}
          className="bg-[#2C3A30] text-white font-medium py-3 px-8 shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
        >
          {isLoading ? "Salvando..." : "Finalizar Matrícula"}
        </button>
      )}
    </div>
  );
}
