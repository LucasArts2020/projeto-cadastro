import { Fragment } from "react";

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
        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${
          isActive
            ? "bg-[#8CAB91] border-[#8CAB91] text-white shadow-lg shadow-[#8CAB91]/30 scale-110" // Etapa Atual (Sálvia)
            : isCompleted
              ? "bg-[#2C3A30] border-[#2C3A30] text-white" // Etapa Concluída (Verde Escuro)
              : "bg-white border-stone-200 text-stone-300" // Inativo
        }`}
      >
        {isCompleted ? (
          <CheckIcon />
        ) : (
          <span
            className={`font-serif font-bold text-sm ${isActive ? "text-white" : ""}`}
          >
            {num}
          </span>
        )}
      </div>
      <span
        className={`mt-3 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${
          isActive
            ? "text-[#8CAB91]"
            : isCompleted
              ? "text-[#2C3A30]"
              : "text-stone-400"
        }`}
      >
        {title}
      </span>
    </div>
  );
};

interface StepperProps {
  currentStep: number;
}

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="bg-white px-8 py-8 border-b border-stone-100 flex justify-center relative">
      {/* Linha de Fundo (Cinza Claro) */}
      <div className="absolute top-12 left-1/4 right-1/4 h-px bg-stone-200 z-0"></div>

      {/* Linha de Progresso (Verde Sálvia) */}
      <div
        className={`absolute top-12 left-1/4 h-px bg-[#8CAB91] z-0 transition-all duration-700 ease-in-out ${
          currentStep === 2 ? "w-1/2" : "w-0"
        }`}
      ></div>

      <div className="flex justify-between w-full max-w-md">
        <StepIndicator num={1} title="Dados Pessoais" current={currentStep} />
        <StepIndicator num={2} title="Matrícula" current={currentStep} />
      </div>
    </div>
  );
}
