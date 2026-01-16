import { useState } from "react";
import FormInput from "../components/FormInput"; // Importe o componente melhorado
import { Cadastro } from "../types/typeCadastro";
import { CadastroService } from "../services/CadastroService";

// Interface para aceitar a função de recarregar a lista
interface Props {
  onSuccess?: () => void;
}

export default function TelaCadastro({ onSuccess }: Props) {
  // Estado inicial tipado
  const [cadastroDados, setCadastroDados] = useState<Cadastro>({
    nome: "",
    rg: "",
    cpf: "",
    dataNascimento: "",
    telefone: "",
    telefone2: "",
    endereco: "",
    fotoUrl: null,
    turma: "",
    valorMatricula: 0,
    planoMensal: "",
    valorMensalidade: 0,
    formaPagamento: "",
    diaVencimento: "",
  });

  // Função genérica para atualizar qualquer campo
  function handleChange(name: keyof Cadastro, value: any) {
    setCadastroDados((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Função de salvar com feedback e callback
  async function salvar() {
    try {
      await CadastroService.create(cadastroDados);
      alert("Cadastrado com sucesso ✅");

      // Limpa o formulário para o próximo
      setCadastroDados({
        nome: "",
        rg: "",
        cpf: "",
        dataNascimento: "",
        telefone: "",
        telefone2: "",
        endereco: "",
        fotoUrl: null,
        turma: "",
        valorMatricula: 0,
        planoMensal: "",
        valorMensalidade: 0,
        formaPagamento: "",
        diaVencimento: "",
      });

      // Avisa o componente pai (App) para atualizar a tabela
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar cadastro.");
    }
  }

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Nome ocupa 2 colunas */}
      <FormInput<Cadastro>
        label="Nome Completo"
        name="nome"
        value={cadastroDados.nome}
        onChange={handleChange}
        className="col-span-1 md:col-span-2"
      />

      <FormInput<Cadastro>
        label="RG"
        name="rg"
        value={cadastroDados.rg}
        onChange={handleChange}
      />

      <FormInput<Cadastro>
        label="CPF"
        name="cpf"
        value={cadastroDados.cpf}
        onChange={handleChange}
      />

      <FormInput<Cadastro>
        label="Data de Nascimento"
        name="dataNascimento"
        type="date"
        value={cadastroDados.dataNascimento}
        onChange={handleChange}
      />

      <FormInput<Cadastro>
        label="Telefone"
        name="telefone"
        value={cadastroDados.telefone}
        onChange={handleChange}
      />

      <FormInput<Cadastro>
        label="Telefone 2 (Opcional)"
        name="telefone2"
        value={cadastroDados.telefone2}
        onChange={handleChange}
      />

      {/* Endereço ocupa 2 colunas */}
      <FormInput<Cadastro>
        label="Endereço"
        name="endereco"
        value={cadastroDados.endereco}
        onChange={handleChange}
        className="col-span-1 md:col-span-2"
      />

      {/* Upload de Foto ocupa 2 colunas */}
      <FormInput<Cadastro>
        label="Foto do Aluno"
        name="fotoUrl"
        type="file"
        // Em input file, não passamos 'value' para evitar erros de componente controlado
        onChange={handleChange}
        className="col-span-1 md:col-span-2"
      />

      <hr className="col-span-1 md:col-span-2 my-2 border-gray-200" />

      <FormInput<Cadastro>
        label="Turma"
        name="turma"
        value={cadastroDados.turma}
        onChange={handleChange}
      />

      <FormInput<Cadastro>
        label="Valor Matrícula (R$)"
        name="valorMatricula"
        type="number"
        value={cadastroDados.valorMatricula}
        onChange={handleChange}
      />

      <FormInput<Cadastro>
        label="Plano Mensal"
        name="planoMensal"
        value={cadastroDados.planoMensal}
        onChange={handleChange}
      />

      <FormInput<Cadastro>
        label="Valor Mensalidade (R$)"
        name="valorMensalidade"
        type="number"
        value={cadastroDados.valorMensalidade}
        onChange={handleChange}
      />

      <FormInput<Cadastro>
        label="Forma de Pagamento"
        name="formaPagamento"
        type="select"
        value={cadastroDados.formaPagamento}
        options={[
          { value: "PIX", label: "PIX" },
          { value: "CARTAO", label: "Cartão de Crédito/Débito" },
          { value: "DINHEIRO", label: "Dinheiro" },
          { value: "BOLETO", label: "Boleto Bancário" },
        ]}
        onChange={handleChange}
      />

      <FormInput<Cadastro>
        label="Dia de Vencimento"
        name="diaVencimento"
        type="number"
        value={cadastroDados.diaVencimento}
        onChange={handleChange}
      />

      <button
        onClick={salvar}
        className="col-span-1 md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 mt-4 cursor-pointer"
      >
        Salvar Cadastro
      </button>
    </div>
  );
}
