import TelaTurmas from "../../pages/TelaTurmas";

export default function WrapperTurmas() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up pb-10">
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[600px]">
        <TelaTurmas />
      </div>
    </div>
  );
}
