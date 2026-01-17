import { HashRouter, Routes, Route } from "react-router-dom";

// Layout Components
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import WrapperCadastro from "./components/layout/WrapperCadastro";
import WrapperLista from "./components/layout/WrapperLista";

export default function App() {
  return (
    <HashRouter>
      <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
        {/* Barra Lateral Fixa */}
        <Sidebar />

        {/* Conteúdo Principal */}
        <div className="flex-1 ml-64 flex flex-col">
          <Header />

          <main className="flex-1 p-8 overflow-y-auto">
            <Routes>
              <Route path="/" element={<WrapperCadastro />} />
              <Route path="/lista" element={<WrapperLista />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}
