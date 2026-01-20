/// <reference types="vite/client" />

interface Window {
  api: {
    listCadastros(): Promise<any[]>;
    createCadastro(data: any): Promise<{ success: boolean; error?: string }>;
    deleteCadastro(id: number): Promise<{ success: boolean; error?: string }>;

    saveAttendance(data: any): Promise<any>;
    getAttendanceHistory(): Promise<any>;
    getClassDetails(id: number): Promise<any>;
    deleteClass(id: number): Promise<{ success: boolean; error?: string }>;
  };
}
