import FormInput from "../common/FormInput";
import { Cadastro } from "../../types/typeCadastro";

interface Props {
  data: Cadastro;
  onChange: (name: keyof Cadastro, value: any) => void;
}

export default function StepPersonalData({ data, onChange }: Props) {
  const getPhotoUrl = () => {
    if (!data.fotoUrl) return undefined;
    const cleanPath = data.fotoUrl.replace(/\\/g, "/");
    return `media://${cleanPath}`;
  };

  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const maskPhone = (value: string) => {
    let v = value.replace(/\D/g, "");

    if (v.length > 11) v = v.substring(0, 11);

    if (v.length > 10) {
      return v.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (v.length > 5) {
      return v.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (v.length > 2) {
      return v.replace(/^(\d\d)(\d{0,5}).*/, "($1) $2");
    } else {
      return v.replace(/^(\d*)/, "($1");
    }
  };

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

      <div className="col-span-2 flex justify-center mb-4">
        <FormInput<Cadastro>
          label="Foto do Perfil"
          name="fotoFile"
          type="file"
          value={data.fotoFile}
          onChange={onChange}
          currentPhotoUrl={getPhotoUrl()}
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
        onChange={(name, val) => onChange(name, maskCPF(String(val)))}
        placeholder="000.000.000-00"
        maxLength={14}
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
        onChange={(name, val) => onChange(name, maskPhone(String(val)))}
        placeholder="(00) 00000-0000"
        maxLength={15}
      />
      <FormInput<Cadastro>
        label="Telefone Recado"
        name="telefone2"
        value={data.telefone2}
        onChange={(name, val) => onChange(name, maskPhone(String(val)))}
        placeholder="(00) 0000-0000"
        maxLength={15}
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
