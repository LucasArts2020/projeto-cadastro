import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CadastroService } from "../services/CadastroService";
import { Cadastro } from "../types/typeCadastro";

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

      <StudentTable students={filteredStudents} loading={loading} />
    </div>
  );
}
