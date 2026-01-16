import { useState, useEffect } from "react";
import TelaCadastro from "./pages/TelaCadastro";
import { CadastroService } from "./services/CadastroService";
import { Cadastro } from "./types/typeCadastro";

// Ícones simples usando texto/emoji ou svg (opcional) para dar um charme
const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

function App() {
  const [students, setStudents] = useState<Cadastro[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const list = await CadastroService.list();
      setStudents(list);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 md:px-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* CABEÇALHO */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Painel Escolar
            </h1>
            <p className="text-gray-500">Gerencie alunos e matrículas</p>
          </div>
          <div className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-medium">
            Versão 1.0
          </div>
        </div>

        {/* ÁREA DE CADASTRO (Seu componente) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700">
              Novo Cadastro
            </h2>
          </div>
          {/* Passamos o loadStudents para atualizar a tabela após salvar */}
          <TelaCadastro onSuccess={loadStudents} />
        </div>

        {/* ÁREA DE LISTAGEM (Tabela Estilizada) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Alunos Cadastrados{" "}
              <span className="text-gray-400 text-sm font-normal">
                ({students.length})
              </span>
            </h2>
            <button
              onClick={loadStudents}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
              title="Atualizar lista"
            >
              <RefreshIcon />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold border-b">Nome</th>
                  <th className="p-4 font-semibold border-b">CPF</th>
                  <th className="p-4 font-semibold border-b">Turma</th>
                  <th className="p-4 font-semibold border-b">Plano</th>
                  <th className="p-4 font-semibold border-b text-right">
                    Mensalidade
                  </th>
                  <th className="p-4 font-semibold border-b text-center">
                    Vencimento
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Carregando dados...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-gray-400 italic"
                    >
                      Nenhum aluno cadastrado ainda. Use o formulário acima.
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-0 hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="p-4 font-medium text-gray-900">
                        {student.nome}
                      </td>
                      <td className="p-4">{student.cpf}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-600">
                          {student.turma}
                        </span>
                      </td>
                      <td className="p-4">{student.planoMensal}</td>
                      <td className="p-4 text-right font-medium text-green-600">
                        R$ {Number(student.valorMensalidade || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-blue-100 text-blue-700 py-1 px-2 rounded text-xs font-bold">
                          Dia {student.diaVencimento}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
