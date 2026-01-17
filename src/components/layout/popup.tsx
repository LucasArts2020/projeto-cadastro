type message = {
  children: React.ReactNode;
  onClose: () => void;
};

export default function Popup({ children, onClose }: message) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          {children}{" "}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
