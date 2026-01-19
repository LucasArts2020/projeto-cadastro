"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  listCadastros: () => electron.ipcRenderer.invoke("get-alunos"),
  createCadastro: (data) => electron.ipcRenderer.invoke("add-aluno", data),
  saveImage: (file) => electron.ipcRenderer.invoke("save-image", {
    name: file.name,
    buffer: file.buffer
  })
});
