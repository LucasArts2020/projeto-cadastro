export const CadastroService = {
  list: async () => {
    return await window.api.listCadastros();
  },

  create: async (data: any) => {
    return await window.api.createCadastro(data);
  },
};
