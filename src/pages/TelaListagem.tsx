import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CadastroService } from "../services/CadastroService";
import { Cadastro } from "../types/typeCadastro";

import SummaryCards from "../components/listagem/SummaryCards";
import ActionBar from "../components/listagem/ActionBar";
import StudentTable from "../components/listagem/StudentTable";
// Importamos o Modal que criamos no passo anterior
import ModalEditarAluno from "../components/listagem/ModalEditorAluno";

export default function TelaListagem() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Cadastro[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para controlar qual aluno está sendo editado (se null, modal fecha)
  const [studentToEdit, setStudentToEdit] = useState<Cadastro | null>(null);

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

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cpf.includes(searchTerm) ||
        s.turma.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [students, searchTerm]);

  const totalAlunos = students.length;
  const receitaEstimada = students.reduce(
    (acc, curr) => acc + (Number(curr.valorMensalidade) || 0),
    0,
  );
  const mediaMensalidade = totalAlunos > 0 ? receitaEstimada / totalAlunos : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <SummaryCards
        total={totalAlunos}
        receita={receitaEstimada}
        ticketMedio={mediaMensalidade}
      />

      <ActionBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewStudent={() => navigate("/")}
      />

      {/* Passamos a função onSelect para abrir o modal ao clicar na linha */}
      <StudentTable
        students={filteredStudents}
        loading={loading}
        onSelect={(student) => setStudentToEdit(student)}
      />

      {/* Renderização Condicional do Modal de Edição */}
      {studentToEdit && (
        <ModalEditarAluno
          student={studentToEdit}
          onClose={() => setStudentToEdit(null)}
          onSuccess={() => {
            loadStudents(); // Recarrega a lista para mostrar os dados atualizados
            // Opcional: setStudentToEdit(null) já acontece no onClose,
            // mas garante que feche após o sucesso
          }}
        />
      )}
    </div>
  );
}
