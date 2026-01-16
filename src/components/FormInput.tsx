import { ComponentProps } from "react";

// Adicionei mais tipos comuns caso precise
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

// Omitimos 'value' e 'onChange' do HTML padrão para usar os nossos tipados
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
    // 1. Tratamento Especial para Arquivos
    if (type === "file") {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0] ?? null;
      // Forçamos o cast para o tipo genérico
      onChange(name, file as T[keyof T]);
      return;
    }

    // 2. Tratamento Especial para Números
    if (type === "number") {
      const val = e.target.value === "" ? 0 : Number(e.target.value);
      onChange(name, val as T[keyof T]);
      return;
    }

    // 3. Padrão (Texto, Data, Select)
    onChange(name, e.target.value as T[keyof T]);
  }

  // Evita erro de "uncontrolled component" transformando null/undefined em string vazia
  // Exceto para 'file', que deve ser undefined mesmo
  const safeValue = type === "file" ? undefined : ((value as any) ?? "");

  // Estilo padrão bonito (Tailwind)
  const inputStyle =
    "border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all w-full bg-white text-gray-700";

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm font-semibold text-gray-700">{label}</label>

      {type === "select" ? (
        <select
          name={String(name)}
          value={safeValue}
          onChange={handleChange}
          className={inputStyle}
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
          className={`${inputStyle} ${type === "file" ? "p-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" : ""}`}
          {...props}
        />
      )}
    </div>
  );
}
