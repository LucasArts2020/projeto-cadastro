export const CadastroService = {
  list: () => window.api.listCadastros(),
  create: (data) => window.api.createCadastro(data),
};
