import { Cadastro } from "../types/typeCadastro";

export const CadastroService = {
  list: async () => {
    return await window.api.listCadastros();
  },

  create: async (data: Cadastro) => {
    let fotoPath = data.fotoUrl;
    if (data.fotoFile) {
      const buffer = await data.fotoFile.arrayBuffer();
      // @ts-ignore
      fotoPath = await window.api.saveImage({
        name: data.fotoFile.name,
        buffer,
      });
    }

    return await window.api.createCadastro({
      ...data,
      fotoUrl: fotoPath,
      fotoFile: undefined,
    });
  },

  update: async (data: Cadastro) => {
    let fotoPath = data.fotoUrl;

    if (data.fotoFile) {
      const buffer = await data.fotoFile.arrayBuffer();
      // @ts-ignore
      fotoPath = await window.api.saveImage({
        name: data.fotoFile.name,
        buffer,
      });
    }

    // @ts-ignore
    return await window.api.updateCadastro({
      ...data,
      fotoUrl: fotoPath,
      fotoFile: undefined,
    });
  },
  delete: async (id: number) => {
    // @ts-ignore
    return await window.api.deleteCadastro(id);
  },
};
