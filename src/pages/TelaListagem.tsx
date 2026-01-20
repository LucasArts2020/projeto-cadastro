import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CadastroService } from "../services/CadastroService";
import { Cadastro } from "../types/typeCadastro";

import ActionBar from "../components/listagem/ActionBar";
import StudentTable from "../components/listagem/StudentTable";
import ModalEditarAluno from "../components/listagem/ModalEditorAluno";
import ModalDetalhesAluno from "../components/listagem/ModalDetalhesAluno";
import ModalFiltros, {
  FilterOptions,
} from "../components/listagem/ModalFiltros";

export default function TelaListagem() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Cadastro[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ESTADOS DE FILTRO (Agora inclui array de dias)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    horario: "",
    dias: [],
    diaVencimento: "",
    planoMensal: "",
  });

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

  const handleDelete = async (student: Cadastro) => {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir o aluno ${student.nome}?`,
    );
    if (confirmou && student.id) {
      setLoading(true);
      try {
        const response = await CadastroService.delete(student.id);
        if (response.success) loadStudents();
        else alert("Erro ao excluir: " + response.error);
      } catch (error) {
        console.error(error);
        alert("Erro ao tentar excluir.");
      } finally {
        setLoading(false);
      }
    }
  };

  // --- LÓGICA DE FILTRAGEM ATUALIZADA ---
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // 1. Busca por Texto (Nome, CPF ou Turma)
      const matchesSearch =
        searchTerm === "" ||
        s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cpf.includes(searchTerm) ||
        (s.turma && s.turma.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Filtro de Horário
      const matchesHorario =
        filters.horario === "" || s.horarioAula === filters.horario;

      // 3. Filtro de Dias da Semana (Interseção)
      // Se nenhum dia foi selecionado no filtro, passa todos.
      // Se selecionou dias, o aluno precisa ter pelo menos UM desses dias na lista dele.
      const matchesDias =
        filters.dias.length === 0 ||
        (s.diasSemana &&
          s.diasSemana.some((diaAluno) => filters.dias.includes(diaAluno)));

      // 4. Filtros Financeiros
      const matchesDiaVenc =
        filters.diaVencimento === "" ||
        String(s.diaVencimento) === filters.diaVencimento;

      const matchesPlano =
        filters.planoMensal === "" || s.planoMensal === filters.planoMensal;

      return (
        matchesSearch &&
        matchesHorario &&
        matchesDias &&
        matchesDiaVenc &&
        matchesPlano
      );
    });
  }, [students, searchTerm, filters]);

  // Conta filtros ativos (se array dias > 0 conta como +1)
  const activeFiltersCount =
    [filters.horario, filters.diaVencimento, filters.planoMensal].filter(
      Boolean,
    ).length + (filters.dias.length > 0 ? 1 : 0);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <ActionBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewStudent={() => navigate("/cadastro")}
        onFilterClick={() => setIsFilterOpen(true)}
        activeFiltersCount={activeFiltersCount}
      />

      <StudentTable
        students={filteredStudents}
        loading={loading}
        onSelect={(student) => setViewStudent(student)}
        onDelete={handleDelete}
      />

      {/* --- MODAIS --- */}

      <ModalFiltros
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        currentFilters={filters}
        onApply={setFilters}
      />

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
