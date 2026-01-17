// src/pages/TelaListagem.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CadastroService } from "../services/CadastroService";
import { Cadastro } from "../types/typeCadastro";

// Importando nossos novos componentes
import SummaryCards from "../components/listagem/SummaryCards";
import ActionBar from "../components/listagem/ActionBar";
import StudentTable from "../components/listagem/StudentTable";

export default function TelaListagem() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Cadastro[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  // --- LÓGICA DE NEGÓCIO ---

  // Filtro
  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cpf.includes(searchTerm) ||
        s.turma.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [students, searchTerm]);

  // Cálculos
  const totalAlunos = students.length;
  const receitaEstimada = students.reduce(
    (acc, curr) => acc + (Number(curr.valorMensalidade) || 0),
    0,
  );
  const mediaMensalidade = totalAlunos > 0 ? receitaEstimada / totalAlunos : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* 1. Cards de Resumo */}
      <SummaryCards
        total={totalAlunos}
        receita={receitaEstimada}
        ticketMedio={mediaMensalidade}
      />

      {/* 2. Barra de Ações (Busca e Botões) */}
      <ActionBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewStudent={() => navigate("/")}
      />

      {/* 3. Tabela de Alunos */}
      <StudentTable students={filteredStudents} loading={loading} />
    </div>
  );
}
