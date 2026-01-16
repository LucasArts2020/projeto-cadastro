import { useState, useEffect } from "react";

// Tipo igual ao do Banco de Dados
interface Student {
  id: number;
  nome: string;
  rg: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  telefoneEmergencia: string;
  endereco: string;
  turma: string;
  valorMatricula: number;
  planoMensal: string;
  valorMensalidade: number;
  formaPagamento: string;
  diaVencimento: number;
}

// Tipo da resposta ao salvar (para o TypeScript não reclamar)
interface SaveResponse {
  success: boolean;
  error?: string;
}

function App() {
  const [students, setStudents] = useState<Student[]>([]);

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: "",
    rg: "",
    cpf: "",
    dataNascimento: "",
    telefone: "",
    telefoneEmergencia: "",
    endereco: "",
    turma: "",
    valorMatricula: "",
    planoMensal: "",
    valorMensalidade: "",
    formaPagamento: "",
    diaVencimento: "",
  });

  // Carrega os alunos assim que a tela abre
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      console.log("Buscando alunos...");
      // AQUI: Adicionamos <Student[]> para dizer que volta uma lista de alunos
      const list = await window.ipcRenderer.invoke<Student[]>("get-alunos");
      setStudents(list);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // AQUI: Adicionamos <SaveResponse> para saber que volta { success: boolean }
    const result = await window.ipcRenderer.invoke<SaveResponse>(
      "add-aluno",
      formData,
    );

    if (result.success) {
      alert("Aluno cadastrado com sucesso!");
      loadStudents(); // Atualiza a lista na hora

      // Limpa o formulário
      setFormData({
        nome: "",
        rg: "",
        cpf: "",
        dataNascimento: "",
        telefone: "",
        telefoneEmergencia: "",
        endereco: "",
        turma: "",
        valorMatricula: "",
        planoMensal: "",
        valorMensalidade: "",
        formaPagamento: "",
        diaVencimento: "",
      });
    } else {
      alert("Erro ao cadastrar: " + result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">
          Sistema de Cadastro
        </h1>

        {/* --- FORMULÁRIO --- */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Novo Aluno
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <input
              name="nome"
              placeholder="Nome Completo"
              value={formData.nome}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              name="rg"
              placeholder="RG"
              value={formData.rg}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              name="cpf"
              placeholder="CPF"
              value={formData.cpf}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              name="dataNascimento"
              type="date"
              value={formData.dataNascimento}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              name="telefone"
              placeholder="Telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              name="telefoneEmergencia"
              placeholder="Tel. Emergência"
              value={formData.telefoneEmergencia}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              name="endereco"
              placeholder="Endereço"
              value={formData.endereco}
              onChange={handleChange}
              className="border p-2 rounded col-span-1 md:col-span-3"
              required
            />

            <input
              name="turma"
              placeholder="Turma"
              value={formData.turma}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              name="valorMatricula"
              type="number"
              step="0.01"
              placeholder="Valor Matrícula (R$)"
              value={formData.valorMatricula}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              name="planoMensal"
              placeholder="Plano Mensal"
              value={formData.planoMensal}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              name="valorMensalidade"
              type="number"
              step="0.01"
              placeholder="Valor Mensalidade (R$)"
              value={formData.valorMensalidade}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

            <select
              name="formaPagamento"
              value={formData.formaPagamento}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            >
              <option value="">Forma de Pagamento</option>
              <option value="Boleto">Boleto</option>
              <option value="Cartão">Cartão</option>
              <option value="PIX">PIX</option>
              <option value="Dinheiro">Dinheiro</option>
            </select>

            <input
              name="diaVencimento"
              type="number"
              placeholder="Dia Vencimento"
              value={formData.diaVencimento}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

            <button
              type="submit"
              className="col-span-1 md:col-span-3 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 font-bold transition cursor-pointer"
            >
              Salvar Aluno
            </button>
          </form>
        </div>

        {/* --- LISTAGEM --- */}
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Alunos Cadastrados ({students.length})
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3">ID</th>
                <th className="p-3">Nome</th>
                <th className="p-3">CPF</th>
                <th className="p-3">Turma</th>
                <th className="p-3">Mensalidade</th>
                <th className="p-3">Vencimento</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-500">#{student.id}</td>
                  <td className="p-3 font-medium">{student.nome}</td>
                  <td className="p-3">{student.cpf}</td>
                  <td className="p-3">{student.turma}</td>
                  <td className="p-3">
                    R$ {Number(student.valorMensalidade).toFixed(2)}
                  </td>
                  <td className="p-3">Dia {student.diaVencimento}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    Nenhum aluno cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
