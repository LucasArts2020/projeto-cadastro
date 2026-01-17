// src/components/cadastro/FormActions.tsx
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
  return (
    <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-between items-center mt-auto">
      {step === 2 ? (
        <button
          onClick={onBack}
          className="text-gray-600 font-semibold hover:text-gray-900 transition flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer"
        >
          ← Voltar
        </button>
      ) : (
        <div />
      )}

      {step === 1 ? (
        <button
          onClick={onNext}
          className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          Continuar <span>→</span>
        </button>
      ) : (
        <button
          onClick={onSave}
          disabled={isLoading}
          className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Salvando..." : "✅ Confirmar Matrícula"}
        </button>
      )}
    </div>
  );
}
