import { useState } from "react";
import { Icons } from "../common/Icons";

import { OPCOES_HORARIOS } from "../../utils/options";

export interface FilterOptions {
  horario: string;
  dias: string[];
  diaVencimento: string;
  planoMensal: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export default function ModalFiltros({
  isOpen,
  onClose,
  onApply,
  currentFilters,
}: Props) {
  const [localFilters, setLocalFilters] =
    useState<FilterOptions>(currentFilters);

  if (!isOpen) return null;

  const handleChange = (field: keyof FilterOptions, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDia = (dia: string) => {
    setLocalFilters((prev) => {
      const diasAtuais = prev.dias || [];
      if (diasAtuais.includes(dia)) {
        return { ...prev, dias: diasAtuais.filter((d) => d !== dia) };
      } else {
        return { ...prev, dias: [...diasAtuais, dia] };
      }
    });
  };

  const handleClear = () => {
    const emptyFilters = {
      horario: "",
      dias: [],
      diaVencimento: "",
      planoMensal: "",
    };
    setLocalFilters(emptyFilters);
    onApply(emptyFilters);
    onClose();
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-stone-700 flex items-center gap-2">
            <Icons.Filter /> Filtros Avançados
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold text-[#8CAB91] uppercase tracking-widest mb-3 border-b border-stone-100 pb-1">
              Turma e Frequência
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                  Horário da Aula
                </label>
                <select
                  value={localFilters.horario}
                  onChange={(e) => handleChange("horario", e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#8CAB91] outline-none text-sm bg-white"
                >
                  <option value="">Todos os Horários</option>
                  {OPCOES_HORARIOS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">
                  Dias da Semana
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIAS_SEMANA.map((dia) => {
                    const isSelected = localFilters.dias.includes(dia);
                    return (
                      <button
                        key={dia}
                        onClick={() => toggleDia(dia)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          isSelected
                            ? "bg-[#8CAB91] text-white border-[#8CAB91]"
                            : "bg-white text-stone-500 border-stone-200 hover:border-[#8CAB91]"
                        }`}
                      >
                        {dia}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Selecione para ver alunos que treinam nestes dias.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-[#8CAB91] uppercase tracking-widest mb-3 border-b border-stone-100 pb-1">
              Financeiro
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                  Vencimento
                </label>
                <select
                  value={localFilters.diaVencimento}
                  onChange={(e) =>
                    handleChange("diaVencimento", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#8CAB91] outline-none text-sm bg-white"
                >
                  <option value="">Todos</option>
                  {[5, 10, 15, 20, 25, 30].map((d) => (
                    <option key={d} value={d}>
                      Dia {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                  Plano
                </label>
                <select
                  value={localFilters.planoMensal}
                  onChange={(e) => handleChange("planoMensal", e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#8CAB91] outline-none text-sm bg-white"
                >
                  <option value="">Todos</option>
                  <option value="Mensal">Mensal</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Semestral">Semestral</option>
                  <option value="Anual">Anual</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Ações */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-between gap-3">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"
          >
            Limpar Filtros
          </button>

          <button
            onClick={handleApply}
            className="px-6 py-2 bg-[#8CAB91] text-white hover:bg-[#7A9B7F] rounded-lg shadow-sm transition font-medium text-sm flex-1"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}
