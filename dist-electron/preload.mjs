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
  confirmarPagamento: (id) => electron.ipcRenderer.invoke("confirmar-pagamento", id),
  getLimits: () => electron.ipcRenderer.invoke("get-limits"),
  saveLimit: (data) => electron.ipcRenderer.invoke("save-limit", data),
  getAbsences: () => electron.ipcRenderer.invoke("get-absences"),
  checkAvailability: (date, dayOfWeek) => electron.ipcRenderer.invoke("check-availability", { date, dayOfWeek }),
  scheduleReplacement: (data) => electron.ipcRenderer.invoke("schedule-replacement", data),
  getReplacementsByDate: (date) => electron.ipcRenderer.invoke("get-replacements-date", date)
});
