/// <reference types="vite/client" />

interface Window {
  api: {
    listCadastros(): Promise<any[]>;
    createCadastro(data: any): Promise<{ success: boolean; error?: string }>;
    deleteCadastro(id: number): Promise<{ success: boolean; error?: string }>;

    // (Opcional) Adicione as outras se faltarem:
    saveAttendance(data: any): Promise<any>;
    getAttendanceHistory(): Promise<any>;
    getClassDetails(id: number): Promise<any>;
    deleteClass(id: number): Promise<{ success: boolean; error?: string }>;
  };
}
