import { ComponentProps } from "react";

// Ícone de Câmera para o botão de upload
const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

type InputType =
  | "text"
  | "number"
  | "date"
  | "file"
  | "select"
  | "email"
  | "password";

interface SelectOption {
  value: string;
  label: string;
}

interface FormInputProps<T> extends Omit<
  ComponentProps<"input">,
  "name" | "onChange" | "value"
> {
  label: string;
  name: keyof T;
  type?: InputType;
  value?: T[keyof T];
  onChange: (name: keyof T, value: T[keyof T]) => void;
  options?: SelectOption[];
  className?: string;
}

export default function FormInput<T>({
  label,
  name,
  type = "text",
  value,
  onChange,
  options = [],
  className = "",
  ...props
}: FormInputProps<T>) {
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    // 1. Tratamento Especial para Arquivos (Lógica Mantida)
    if (type === "file") {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0] ?? null;
      onChange(name, file as T[keyof T]);
      return;
    }

    // 2. Tratamento Especial para Números
    if (type === "number") {
      const val = e.target.value === "" ? 0 : Number(e.target.value);
      onChange(name, val as T[keyof T]);
      return;
    }

    // 3. Padrão
    onChange(name, e.target.value as T[keyof T]);
  }

  const safeValue = type === "file" ? undefined : ((value as any) ?? "");

  // ESTILO DOS INPUTS:
  // rounded-3xl para ficar bem redondo como na imagem de referência
  const inputStyle =
    "border border-stone-200 rounded-3xl px-5 py-3 bg-[#F9F9F9] text-stone-700 focus:ring-2 focus:ring-[#8CAB91]/50 focus:border-[#8CAB91] outline-none transition-all w-full placeholder-stone-400 shadow-sm";

  // --- RENDERIZAÇÃO ESPECIAL PARA FOTO (Estilo Circular) ---
  if (type === "file") {
    return (
      <div
        className={`flex flex-col items-center justify-center py-4 ${className}`}
      >
        {/* Label invisível para acessibilidade, o botão visual faz o papel */}
        <label className="group cursor-pointer flex flex-col items-center justify-center relative">
          {/* Círculo da Foto */}
          <div className="w-24 h-24 rounded-full bg-white border-2 border-dashed border-[#8CAB91] flex items-center justify-center text-[#8CAB91] shadow-md group-hover:bg-[#8CAB91] group-hover:text-white group-hover:border-transparent transition-all duration-300 transform group-hover:scale-105">
            {/* Se tiver valor (arquivo selecionado), mostra um check ou preview simples */}
            {value ? <span className="text-2xl">📸</span> : <CameraIcon />}
          </div>

          {/* Texto "Add Photo" */}
          <span className="mt-3 text-xs font-bold text-[#8CAB91] uppercase tracking-widest group-hover:text-[#2C3A30] transition-colors">
            {value ? "Alterar Foto" : label}
          </span>

          {/* Input original escondido (Mantendo a lógica) */}
          <input
            type="file"
            name={String(name)}
            onChange={handleChange}
            className="hidden" // Escondemos o input feio padrão
            accept="image/*"
            {...props}
          />
        </label>
      </div>
    );
  }

  // --- RENDERIZAÇÃO PADRÃO (Inputs de Texto/Select) ---
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label com recuo para alinhar com a curva do input */}
      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-4">
        {label}
      </label>

      {type === "select" ? (
        <select
          name={String(name)}
          value={safeValue}
          onChange={handleChange}
          className={`${inputStyle} appearance-none`} // appearance-none remove a seta padrão feia
          {...(props as any)}
        >
          <option value="">Selecione...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={String(name)}
          value={safeValue}
          onChange={handleChange}
          className={inputStyle}
          {...props}
        />
      )}
    </div>
  );
}
