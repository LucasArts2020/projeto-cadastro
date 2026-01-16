/// <reference types="vite/client" />

interface Window {
  ipcRenderer: {
    // <T> permite que o front-end diga qual o tipo de resposta espera (Ex: Student[])
    // O padrão é 'unknown' para forçar você a definir o tipo ou verificar antes de usar.
    invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T>;

    send(channel: string, ...args: unknown[]): void;

    on(channel: string, func: (...args: unknown[]) => void): void;

    off(channel: string, func: (...args: unknown[]) => void): void;
  };
}
