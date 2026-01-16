/// <reference types="vite/client" />

interface Window {
  api: {
    listCadastros(): Promise<any[]>;
    createCadastro(data: any): Promise<{ success: boolean; error?: string }>;
  };
}
