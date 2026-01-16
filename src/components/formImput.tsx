import React from "react";

type InputType = "text" | "number" | "date" | "file" | "select";

interface SelectOption {
  value: string;
  label: string;
}

interface FormInputProps<T> {
  label: string;
  name: keyof T;
  type?: InputType;
  value?: T[keyof T];
  onChange: (name: keyof T, value: T[keyof T]) => void;
  options?: SelectOption[];
  className?: string;
}

function FormInput<T extends Record<string, any>>({
  label,
  name,
  type = "text",
  value,
  onChange,
  options = [],
  className = "",
}: FormInputProps<T>) {
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    if (type === "file") {
      const input = e.target as HTMLInputElement;
      onChange(name, (input.files?.[0] ?? null) as T[keyof T]);
      return;
    }

    if (type === "number") {
      onChange(
        name,
        (e.target.value === "" ? 0 : Number(e.target.value)) as T[keyof T]
      );
      return;
    }

    onChange(name, e.target.value as T[keyof T]);
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-medium mb-1">{label}</label>

      {type === "select" ? (
        <select
          value={value as string}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Selecione</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={type === "file" ? undefined : (value as any)}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      )}
    </div>
  );
}

export default FormInput;
