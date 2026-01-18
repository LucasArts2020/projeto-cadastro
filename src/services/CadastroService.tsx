import { Cadastro } from "../types/typeCadastro";

export const CadastroService = {
  list: async () => {
    return await window.api.listCadastros();
  },

  create: async (data: Cadastro) => {
    let fotoPath: string | null = null;

    if (data.fotoFile) {
      fotoPath = await window.api.saveImage(data.fotoFile);
    }

    return await window.api.createCadastro({
      ...data,
      fotoUrl: fotoPath,
      fotoFile: undefined,
    });
  },
};
