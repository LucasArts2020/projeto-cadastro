"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  // Conecta a chamada .listCadastros() ao canal 'get-alunos' do Main
  listCadastros: () => electron.ipcRenderer.invoke("get-alunos"),
  // Conecta a chamada .createCadastro() ao canal 'add-aluno' do Main
  createCadastro: (data) => electron.ipcRenderer.invoke("add-aluno", data)
});
