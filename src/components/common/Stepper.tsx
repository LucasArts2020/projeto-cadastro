// src/components/common/Stepper.tsx
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
        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-300 scale-110" : isCompleted ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-300 text-gray-400"}`}
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

interface StepperProps {
  currentStep: number;
}

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="bg-gray-50 px-8 py-8 border-b border-gray-100 flex justify-center relative">
      <div className="absolute top-12 left-1/4 right-1/4 h-1 bg-gray-200 -z-0 rounded"></div>
      <div
        className={`absolute top-12 left-1/4 h-1 bg-emerald-500 -z-0 rounded transition-all duration-500 ${currentStep === 2 ? "w-1/2" : "w-0"}`}
      ></div>

      <div className="flex justify-between w-full max-w-md">
        <StepIndicator num={1} title="Dados Pessoais" current={currentStep} />
        <StepIndicator num={2} title="Matrícula" current={currentStep} />
      </div>
    </div>
  );
}
