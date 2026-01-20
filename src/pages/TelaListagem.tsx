import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CadastroService } from "../services/CadastroService";
import { Cadastro } from "../types/typeCadastro";

import ActionBar from "../components/listagem/ActionBar";
import StudentTable from "../components/listagem/StudentTable";
import ModalEditarAluno from "../components/listagem/ModalEditorAluno";
import ModalDetalhesAluno from "../components/listagem/ModalDetalhesAluno";

export default function TelaListagem() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Cadastro[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados dos Modais
  const [viewStudent, setViewStudent] = useState<Cadastro | null>(null);
  const [editStudent, setEditStudent] = useState<Cadastro | null>(null);

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

  // --- FUNÇÃO DE DELETAR ---
  const handleDelete = async (student: Cadastro) => {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir o aluno ${student.nome}? \nEssa ação não pode ser desfeita.`,
    );

    if (confirmou && student.id) {
      setLoading(true);
      try {
        const response = await CadastroService.delete(student.id);

        if (response.success) {
          loadStudents();
        } else {
          alert("Erro ao excluir: " + response.error);
        }
      } catch (error) {
        console.error(error);
        alert("Erro ao tentar excluir.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Filtros de Pesquisa
  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cpf.includes(searchTerm) ||
        s.turma.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [students, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* REMOVIDO: SummaryCards e os cálculos associados */}

      <ActionBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewStudent={() => navigate("/cadastro")}
      />

      <StudentTable
        students={filteredStudents}
        loading={loading}
        onSelect={(student) => setViewStudent(student)}
        onDelete={handleDelete}
      />

      {/* Modal de Detalhes (Leitura) */}
      {viewStudent && (
        <ModalDetalhesAluno
          student={viewStudent}
          onClose={() => setViewStudent(null)}
          onEdit={() => {
            setEditStudent(viewStudent);
            setViewStudent(null);
          }}
        />
      )}

      {/* Modal de Edição (Escrita) */}
      {editStudent && (
        <ModalEditarAluno
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSuccess={() => {
            loadStudents();
            setEditStudent(null);
          }}
        />
      )}
    </div>
  );
}
