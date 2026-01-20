type PopupProps = {
  children: React.ReactNode;
  onClose: () => void;
  actions?: React.ReactNode;
};

export default function Popup({ children, onClose, actions }: PopupProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl min-w-[400px]">
        {children}

        <div className="flex justify-end gap-3 mt-6">
          {actions ? (
            actions
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#8CAB91] text-white rounded hover:bg-[#647e68] transition"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
