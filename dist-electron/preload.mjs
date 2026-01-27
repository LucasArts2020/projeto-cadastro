"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  listCadastros: () => electron.ipcRenderer.invoke("get-alunos"),
  createCadastro: (data) => electron.ipcRenderer.invoke("add-aluno", data),
  saveImage: (file) => electron.ipcRenderer.invoke("save-image", {
    name: file.name,
    buffer: file.buffer
  }),
  saveAttendance: (data) => electron.ipcRenderer.invoke("save-attendance", data),
  getAttendanceHistory: () => electron.ipcRenderer.invoke("get-attendance-history"),
  getClassDetails: (id) => electron.ipcRenderer.invoke("get-class-details", id),
  updateCadastro: (data) => electron.ipcRenderer.invoke("update-aluno", data),
  deleteCadastro: (id) => electron.ipcRenderer.invoke("delete-aluno", id),
  deleteClass: (id) => electron.ipcRenderer.invoke("delete-class", id),
  confirmarPagamento: (id) => electron.ipcRenderer.invoke("confirmar-pagamento", id)
});
