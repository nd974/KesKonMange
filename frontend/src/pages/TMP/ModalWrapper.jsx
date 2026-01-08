// ModalWrapper.js
export default function ModalWrapper({ children, onClose, className = "" }) {
    console.log("children", children.type);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-xl max-w-md w-full p-6 relative">
        <button
          className="absolute top-10 right-10 text-lg font-bold transition"
          onClick={onClose}
        >
         ❌
        </button>
        {children}
      </div>
    </div>
  );
}

