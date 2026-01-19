import { Icons } from "./Icons";

interface Props {
  currentStep: number;
}

export default function Stepper({ currentStep }: Props) {
  const steps = [
    { id: 1, label: "Pessoal" },
    { id: 2, label: "Frequência" }, // Nova etapa
    { id: 3, label: "Financeiro" },
  ];

  return (
    <div className="flex items-center justify-center py-6 bg-white border-b border-gray-100">
      <div className="flex items-center w-full max-w-2xl px-8">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex-1 flex items-center">
              {/* Bolinha do Passo */}
              <div className="relative flex flex-col items-center group">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 
                  ${
                    isActive
                      ? "border-[#8CAB91] bg-[#8CAB91] text-white shadow-lg shadow-[#8CAB91]/30 scale-110"
                      : isCompleted
                        ? "border-[#8CAB91] bg-[#8CAB91] text-white"
                        : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <Icons.CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="font-bold text-sm">{step.id}</span>
                  )}
                </div>
                <span
                  className={`absolute -bottom-6 text-xs font-medium tracking-wide whitespace-nowrap transition-colors duration-300 ${
                    isActive ? "text-[#8CAB91]" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Linha Conectora (não mostra no último item) */}
              {index !== steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-gray-100 relative overflow-hidden rounded-full">
                  <div
                    className={`absolute inset-0 bg-[#8CAB91] transition-all duration-500 ease-out ${
                      isCompleted ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
