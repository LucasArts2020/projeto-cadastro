import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  listCadastros: () => ipcRenderer.invoke("get-alunos"),

  createCadastro: (data: any) => ipcRenderer.invoke("add-aluno", data),

  saveImage: (file: { name: string; buffer: ArrayBuffer }) =>
    ipcRenderer.invoke("save-image", {
      name: file.name,
      buffer: file.buffer,
    }),
  saveAttendance: (data: any) => ipcRenderer.invoke("save-attendance", data),
  getAttendanceHistory: () => ipcRenderer.invoke("get-attendance-history"),
  getClassDetails: (id: number) => ipcRenderer.invoke("get-class-details", id),
  updateCadastro: (data: any) => ipcRenderer.invoke("update-aluno", data),
  deleteCadastro: (id: number) => ipcRenderer.invoke("delete-aluno", id),
  deleteClass: (id: number) => ipcRenderer.invoke("delete-class", id),
  confirmarPagamento: (id: number) =>
    ipcRenderer.invoke("confirmar-pagamento", id),
});
