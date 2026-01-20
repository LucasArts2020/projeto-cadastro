import { HashRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import WrapperCadastro from "./components/layout/WrapperCadastro";
import WrapperLista from "./components/layout/WrapperLista";
import WrapperTurmas from "./components/layout/WrapperTurmas";
import WrapperHistorico from "./components/layout/WrapperHistorico";

export default function App() {
  return (
    <HashRouter>
      <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
        <Sidebar />

        <div className="flex-1 ml-64 flex flex-col">
          <Header />

          <main className="flex-1 p-8 overflow-y-auto">
            <Routes>
              <Route path="/" element={<WrapperLista />} />

              <Route path="/cadastro" element={<WrapperCadastro />} />

              <Route path="/lista" element={<WrapperLista />} />
              <Route path="/turmas" element={<WrapperTurmas />} />
              <Route path="/historico" element={<WrapperHistorico />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}
