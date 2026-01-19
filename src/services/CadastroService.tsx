import { Cadastro } from "../types/typeCadastro";

export const CadastroService = {
  list: async () => {
    return await window.api.listCadastros();
  },

  create: async (data: Cadastro) => {
    let fotoPath = data.fotoUrl; // Mantém a URL se já existir (caso de update sem foto nova)

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

  // --- NOVA FUNÇÃO DE UPDATE ---
  update: async (data: Cadastro) => {
    let fotoPath = data.fotoUrl;

    // Se o usuário selecionou uma NOVA foto
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
      fotoFile: undefined, // Não mandamos o arquivo cru pro banco
    });
  },
};
