import { useState, useEffect } from "react";
import { ConfigService } from "../services/ConfigService";
import { Icons } from "../components/common/Icons";
import Popup from "../components/layout/popup";

// LISTA PADRÃO EXATA
const HORARIOS_PADRAO = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "12:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "19:30",
  "20:00",
  "21:00",
];

export default function TelaConfiguracoes() {
  const [items, setItems] = useState<{ time: string; limit: number }[]>([]);
  const [originalLimits, setOriginalLimits] = useState<Record<string, number>>(
    {},
  );
  const [newTime, setNewTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const limits = await ConfigService.getLimits();
      setOriginalLimits(limits);

      const entries = Object.entries(limits);

      if (entries.length === 0) {
        // Se o banco estiver vazio, usa a lista padrão solicitada
        const defaults = HORARIOS_PADRAO.map((horario) => ({
          time: horario,
          limit: 6,
        }));
        setItems(defaults);
      } else {
        setItems(
          entries
            .map(([time, limit]) => ({ time, limit }))
            .sort((a, b) => a.time.localeCompare(b.time)),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTime = () => {
    if (!newTime) return;
    if (items.some((i) => i.time === newTime)) {
      alert("Este horário já existe!");
      return;
    }
    const newItems = [...items, { time: newTime, limit: 6 }].sort((a, b) =>
      a.time.localeCompare(b.time),
    );
    setItems(newItems);
    setNewTime("");
  };

  const handleRemoveTime = (timeToRemove: string) => {
    if (confirm(`Remover o horário ${timeToRemove}?`)) {
      setItems(items.filter((i) => i.time !== timeToRemove));
    }
  };

  const handleChangeLimit = (time: string, newLimit: string) => {
    const val = parseInt(newLimit) || 0;
    setItems(items.map((i) => (i.time === time ? { ...i, limit: val } : i)));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const oldTimes = Object.keys(originalLimits);
      const newTimes = items.map((i) => i.time);
      const toDelete = oldTimes.filter((t) => !newTimes.includes(t));

      for (const t of toDelete) {
        await ConfigService.deleteLimit(t);
      }

      for (const item of items) {
        await ConfigService.saveLimit(item.time, item.limit);
      }

      const newOriginal: Record<string, number> = {};
      items.forEach((i) => (newOriginal[i.time] = i.limit));
      setOriginalLimits(newOriginal);

      setShowSuccess(true);
    } catch (e) {
      alert("Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/30">
      <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-gray-800 flex items-center gap-2">
            <Icons.Settings size={28} /> Configurações
          </h2>
          <p className="text-sm text-gray-500">
            Gerencie os horários de aula e limites de alunos.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 bg-[#2C2C2C] text-white rounded-lg hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 font-bold flex items-center gap-2"
        >
          {loading ? (
            "Salvando..."
          ) : (
            <>
              {" "}
              <Icons.CheckCircle /> Salvar Alterações{" "}
            </>
          )}
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto pb-24 max-w-4xl mx-auto w-full">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            Adicionar Novo Horário
          </h3>
          <div className="flex gap-4">
            <input
              type="time"
              className="border p-3 rounded-xl bg-gray-50 text-lg outline-none focus:ring-2 focus:ring-[#8CAB91]"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
            <button
              onClick={handleAddTime}
              className="bg-[#8CAB91] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#7a967f] transition-colors"
            >
              + Adicionar
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="font-bold text-gray-700">Horários Ativos</h3>
          <span className="text-xs text-gray-400 font-medium">
            Total: {items.length} horários
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.time}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-gray-800 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 min-w-[100px] text-center">
                  {item.time}
                </span>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Limite
                  </label>
                  <input
                    type="number"
                    className="border-b-2 border-gray-200 w-16 text-center font-bold text-lg focus:border-[#8CAB91] outline-none bg-transparent"
                    value={item.limit}
                    onChange={(e) =>
                      handleChangeLimit(item.time, e.target.value)
                    }
                  />
                </div>

                <button
                  onClick={() => handleRemoveTime(item.time)}
                  className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Remover este horário"
                >
                  <Icons.XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showSuccess && (
        <Popup onClose={() => setShowSuccess(false)}>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl animate-bounce-slow">
              <Icons.CheckCircle />
            </div>
            <h3 className="text-xl font-bold mb-2">Salvo com Sucesso!</h3>
            <p className="text-gray-600">
              As configurações de horário foram atualizadas.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-6 bg-gray-800 text-white px-6 py-2 rounded-lg w-full hover:bg-black transition-colors"
            >
              OK
            </button>
          </div>
        </Popup>
      )}
    </div>
  );
}
