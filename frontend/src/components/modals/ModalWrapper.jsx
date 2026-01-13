import React from "react";

export default function ModalWrapper({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-5">
      <div
        className="rounded-xl max-w-md w-full p-6 relative overflow-y-auto bg-gray-100"
      >
        <button
          className="absolute top-4 right-4 text-lg font-bold px-2 py-1 rounded transition"
          onClick={onClose}
        >
          ❌
        </button>
        {children}
      </div>
    </div>
  );
}
