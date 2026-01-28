import { app, BrowserWindow, ipcMain, protocol, net, Menu } from "electron";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs";

import { DatabaseManager } from "./database/DatabaseManager";
import { StudentRepository } from "./repositories/StudentRepository";
import { AttendanceRepository } from "./repositories/AttendanceRepository";
import { ConfigRepository } from "./repositories/ConfigRepository";
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

Menu.setApplicationMenu(null);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

const dbSavePath = path.join(app.getPath("userData"), "dados.sqlite");

const wasmSourcePath = path.join(process.env.VITE_PUBLIC, "sql-wasm.wasm");

const dbManager = new DatabaseManager(dbSavePath, wasmSourcePath);

const studentRepo = new StudentRepository(dbManager);

const attendanceRepo = new AttendanceRepository(dbManager);

const configRepo = new ConfigRepository(dbManager);

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

ipcMain.handle("add-aluno", (_, dados) => {
  return studentRepo.create(dados);
});

ipcMain.handle("save-attendance", (_, data) => {
  return attendanceRepo.save(data);
});

ipcMain.handle("get-class-details", (_, classId) => {
  return attendanceRepo.getClassDetails(classId);
});

ipcMain.handle("get-attendance-history", (_, filters) => {
  return attendanceRepo.getHistory(filters);
});
ipcMain.handle("save-image", (_, file) => {
  return studentRepo.saveImg(file);
});

ipcMain.handle("update-aluno", (_, dados) => {
  return studentRepo.update(dados);
});

ipcMain.handle("delete-aluno", async (_, id) => {
  return studentRepo.delete(id);
});
ipcMain.handle("delete-class", (_, id) => {
  return attendanceRepo.delete(id);
});
ipcMain.handle("confirmar-pagamento", (_, id: number) => {
  return studentRepo.confirmarPagamento(id);
});
ipcMain.handle("get-limits", () => {
  return configRepo.getLimits();
});

ipcMain.handle("save-limit", (_, { horario, limite }) => {
  return configRepo.saveLimit(horario, limite);
});
