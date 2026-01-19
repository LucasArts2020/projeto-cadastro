import { Cadastro } from "../types/typeCadastro";

export const CadastroService = {
  list: async () => {
    return await window.api.listCadastros();
  },

  create: async (data: Cadastro) => {
    let fotoPath: string | null = null;

    if (data.fotoFile) {
      console.log("Arquivo recebido:", data.fotoFile);
      const buffer = await data.fotoFile.arrayBuffer();
      // @ts-ignore (se der erro de tipo no window.api)
      fotoPath = await window.api.saveImage({
        name: data.fotoFile.name,
        buffer,
      });
      console.log("Imagem salva em:", fotoPath);
    }

    return await window.api.createCadastro({
      ...data,
      fotoUrl: fotoPath,
      fotoFile: undefined,
    });
  },
};
