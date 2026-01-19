import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  // Conecta a chamada .listCadastros() ao canal 'get-alunos' do Main
  listCadastros: () => ipcRenderer.invoke("get-alunos"),

  // Conecta a chamada .createCadastro() ao canal 'add-aluno' do Main
  createCadastro: (data: any) => ipcRenderer.invoke("add-aluno", data),
  saveAttendance: (data: any) => ipcRenderer.invoke("save-attendance", data),
  getAttendanceHistory: () => ipcRenderer.invoke("get-attendance-history"),
  getClassDetails: (id: number) => ipcRenderer.invoke("get-class-details", id),
});
