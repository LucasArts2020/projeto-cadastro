import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CadastroService } from "../services/CadastroService";
import { Cadastro } from "../types/typeCadastro";
import Popup from "../components/layout/popup";

import ActionBar from "../components/listagem/ActionBar";
import StudentTable from "../components/listagem/StudentTable";
import ModalEditarAluno from "../components/listagem/ModalEditorAluno";
import ModalDetalhesAluno from "../components/listagem/ModalDetalhesAluno";

import ModalGerarDocumento from "../components/listagem/ModalGerarDocumento";
import ModalFiltros, {
  FilterOptions,
} from "../components/listagem/ModalFiltros";

import { PopupState } from "./TelaCadastro";
export default function TelaListagem() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Cadastro[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showpopup, setShowPopup] = useState<PopupState>({
    open: false,
    key: 0,
  });
  const [studentToDelete, setStudentToDelete] = useState<Cadastro | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    horario: "",
    dias: [],
    diaVencimento: "",
    planoMensal: "",
  });

  const [viewStudent, setViewStudent] = useState<Cadastro | null>(null);
  const [editStudent, setEditStudent] = useState<Cadastro | null>(null);
  const [docStudent, setDocStudent] = useState<Cadastro | null>(null); // <--- Novo estado

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
    setStudentToDelete(student);
    setShowPopup({ open: true, key: 4 });
  };
  const confirmDelete = async () => {
    if (!studentToDelete?.id) return;

    setLoading(true);
    try {
      const response = await CadastroService.delete(studentToDelete.id);
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
      setShowPopup({ open: false, key: 0 });
      setStudentToDelete(null);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        searchTerm === "" ||
        s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cpf.includes(searchTerm) ||
        (s.turma && s.turma.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesHorario =
        filters.horario === "" || s.horarioAula === filters.horario;

      const matchesDias =
        filters.dias.length === 0 ||
        (s.diasSemana &&
          s.diasSemana.some((diaAluno) => filters.dias.includes(diaAluno)));

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
          onGenerateDoc={() => {
            setDocStudent(viewStudent);
            setViewStudent(null);
          }}
        />
      )}

      {docStudent && (
        <ModalGerarDocumento
          student={docStudent}
          onClose={() => setDocStudent(null)}
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
      {showpopup.open && showpopup.key === 4 && (
        <Popup
          onClose={() => setShowPopup({ open: false, key: 0 })}
          actions={
            <>
              <button
                onClick={() => setShowPopup({ open: false, key: 0 })}
                className="px-4 py-2 rounded-lg bg-[#8CAB91] text-white hover:bg-[#647e68]"
              >
                Cancelar
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Excluir
              </button>
            </>
          }
        >
          <h2 className="text-lg font-semibold mb-4">Confirmar exclusão</h2>

          <p className="text-stone-600">
            Tem certeza que deseja excluir o aluno{" "}
            <strong>{studentToDelete?.nome}</strong>?
          </p>
        </Popup>
      )}
    </div>
  );
}
