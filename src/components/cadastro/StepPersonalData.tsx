import FormInput from "../common/FormInput";
import { Cadastro } from "../../types/typeCadastro";

interface Props {
  data: Cadastro;
  onChange: (name: keyof Cadastro, value: any) => void;
}

export default function StepPersonalData({ data, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <div className="col-span-2">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          Quem é o aluno?
        </h3>
        <p className="text-sm text-gray-500">
          Preencha os dados de identificação e escolha uma foto.
        </p>
      </div>

      {/* --- MUDANÇA AQUI: Input de Foto Atualizado --- */}
      {/* Removemos a div azul antiga e usamos o FormInput direto */}
      <div className="col-span-2 flex justify-center mb-4">
        <FormInput<Cadastro>
          label="Foto do Perfil"
          name="fotoFile" // Corrigido: Salva no campo de Arquivo
          type="file"
          value={data.fotoFile} // Importante: Passa o valor para gerar o preview
          onChange={onChange}
        />
      </div>

      <FormInput<Cadastro>
        label="Nome Completo"
        name="nome"
        value={data.nome}
        onChange={onChange}
        className="col-span-2"
        autoFocus
        placeholder="Ex: João da Silva"
      />

      <FormInput<Cadastro>
        label="CPF"
        name="cpf"
        value={data.cpf}
        onChange={onChange}
        placeholder="000.000.000-00"
      />

      <FormInput<Cadastro>
        label="RG"
        name="rg"
        value={data.rg}
        onChange={onChange}
      />

      <FormInput<Cadastro>
        label="Data de Nascimento"
        name="dataNascimento"
        type="date"
        value={data.dataNascimento}
        onChange={onChange}
      />

      <FormInput<Cadastro>
        label="Telefone / WhatsApp"
        name="telefone"
        value={data.telefone}
        onChange={onChange}
        placeholder="(00) 00000-0000"
      />

      <FormInput<Cadastro>
        label="Telefone Recado"
        name="telefone2"
        value={data.telefone2}
        onChange={onChange}
        placeholder="(00) 0000-0000"
      />

      <FormInput<Cadastro>
        label="Endereço Completo"
        name="endereco"
        value={data.endereco}
        onChange={onChange}
        className="col-span-2"
        placeholder="Rua, Número, Bairro"
      />
    </div>
  );
}
