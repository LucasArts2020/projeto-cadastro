import { useState } from "react";
import FormInput from "../components/formImput";
import { Cadastro } from "../types/typeCadastro";
import { CadastroService } from "../services/service";

export default function TelaCadastro() {
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

  function handleChange(name: keyof Cadastro, value: Cadastro[keyof Cadastro]) {
    setCadastroDados((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function salvar() {
    await CadastroService.create(cadastroDados);
    alert("Cadastrado com sucesso ✅");
  }

  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      <FormInput<Cadastro>
        label="Nome"
        name="nome"
        value={cadastroDados.nome}
        onChange={handleChange}
        className="col-span-2"
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
        label="Telefone 2"
        name="telefone2"
        value={cadastroDados.telefone2}
        onChange={handleChange}
      />

      <FormInput<Cadastro>
        label="Endereço"
        name="endereco"
        value={cadastroDados.endereco}
        onChange={handleChange}
        className="col-span-2"
      />

      <FormInput<Cadastro>
        label="Foto"
        name="fotoUrl"
        type="file"
        onChange={handleChange}
        className="col-span-2"
      />

      <FormInput<Cadastro>
        label="Turma"
        name="turma"
        value={cadastroDados.turma}
        onChange={handleChange}
      />

      <FormInput<Cadastro>
        label="Valor Matrícula"
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
        label="Valor Mensalidade"
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
          { value: "CARTAO", label: "Cartão" },
          { value: "DINHEIRO", label: "Dinheiro" },
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
        className="col-span-2 bg-blue-600 text-white p-2 rounded mt-4"
      >
        Salvar
      </button>
    </div>
  );
}
