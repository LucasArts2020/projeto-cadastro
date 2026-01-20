import { useState } from "react";
import { Cadastro } from "../../types/typeCadastro";
import { gerarContratoMatricula } from "../../services/DocumentGenerator";

interface Props {
  student: Cadastro;
  onClose: () => void;
}

export default function ModalGerarDocumento({ student, onClose }: Props) {
  const [infoAdicional, setInfoAdicional] = useState("");
  const [taxaMulta, setTaxaMulta] = useState("10"); // <--- Valor padrão 10
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await gerarContratoMatricula(student, infoAdicional, taxaMulta);
      onClose();
    } catch (error) {
      console.error("Erro ao gerar doc", error);
      alert("Erro ao gerar documento.");
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative">
        <div className="bg-stone-50 p-6 border-b border-stone-100 text-center">
          <h3 className="font-serif text-xl text-stone-800 font-bold">
            Gerar Documento
          </h3>
          <p className="text-sm text-stone-500 mt-1">{student.nome}</p>
        </div>

        <div className="p-6">
          {isDownloading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 animate-pulse"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-stone-600 font-medium animate-pulse">
                Gerando arquivo...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                  Taxa de Multa (%)
                </label>
                <input
                  type="number"
                  className="w-full border border-stone-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#8CAB91] focus:border-transparent outline-none transition"
                  placeholder="Ex: 10"
                  value={taxaMulta}
                  onChange={(e) => setTaxaMulta(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                  Informações Adicionais (Opcional)
                </label>
                <textarea
                  className="w-full border border-stone-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#8CAB91] focus:border-transparent outline-none transition resize-none h-24"
                  placeholder="Ex: Observações extras..."
                  value={infoAdicional}
                  onChange={(e) => setInfoAdicional(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {!isDownloading && (
          <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleDownload}
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition flex items-center gap-2 font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Baixar .docx
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
