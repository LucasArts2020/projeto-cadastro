import { app, BrowserWindow, ipcMain, protocol, net } from "electron";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs";

import { DatabaseManager } from "./database/DatabaseManager";
import { StudentRepository } from "./repositories/StudentRepository";
import { AttendanceRepository } from "./repositories/AttendanceRepository";

protocol.registerSchemesAsPrivileged([
  {
    scheme: "media",
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      bypassCSP: true,
    },
  },
]);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

const dbManager = new DatabaseManager(process.env.APP_ROOT);

const studentRepo = new StudentRepository(dbManager);

const attendanceRepo = new AttendanceRepository(dbManager);

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 1000,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.whenReady().then(async () => {
  protocol.handle("media", (request) => {
    try {
      const url = new URL(request.url);

      let filePath = decodeURIComponent(url.hostname + url.pathname);

      if (filePath.startsWith("/")) {
        filePath = filePath.slice(1);
      }

      if (filePath.match(/^[a-zA-Z]\//)) {
        filePath = filePath[0] + ":" + filePath.slice(1);
      }

      const finalizedPath = path.normalize(filePath);

      if (!fs.existsSync(finalizedPath)) {
        return new Response("Arquivo não encontrado", { status: 404 });
      }

      return net.fetch(pathToFileURL(finalizedPath).toString());
    } catch (error) {
      console.error("Erro no protocolo media:", error);
      return new Response("Erro", { status: 500 });
    }
  });

  await dbManager.init();
  createWindow();
});

ipcMain.handle("get-alunos", () => {
  return studentRepo.getAll();
});

ipcMain.handle("add-aluno", (event, dados) => {
  return studentRepo.create(dados);
});

ipcMain.handle("save-attendance", (event, data) => {
  return attendanceRepo.save(data);
});

ipcMain.handle("get-class-details", (event, classId) => {
  return attendanceRepo.getClassDetails(classId);
});
// Procure o handler existente e atualize:
ipcMain.handle("get-attendance-history", (event, filters) => {
  return attendanceRepo.getHistory(filters);
});
ipcMain.handle("save-image", (_, file) => {
  return studentRepo.saveImg(file);
});

ipcMain.handle("update-aluno", (event, dados) => {
  return studentRepo.update(dados);
});
// Procure onde estão os outros handlers (create-aluno, update-aluno...) e adicione:

ipcMain.handle("delete-aluno", async (_, id) => {
  return studentRepo.delete(id);
});
ipcMain.handle("delete-class", (_, id) => {
  return attendanceRepo.delete(id);
});
