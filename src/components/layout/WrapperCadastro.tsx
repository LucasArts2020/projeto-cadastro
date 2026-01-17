import { useNavigate } from "react-router-dom";
import TelaCadastro from "../../pages/TelaCadastro";

export default function WrapperCadastro() {
  const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up pb-10">
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <TelaCadastro onSuccess={() => navigate("/lista")} />
      </div>
    </div>
  );
}
