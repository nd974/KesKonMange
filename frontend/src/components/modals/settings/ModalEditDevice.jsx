import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ModalEditDevice({ isOpen, onClose, profileId }) {
  const [devices, setDevices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");

useEffect(() => {
    if (isOpen && profileId) {
        fetch(`${API_URL}/sessions/get/${profileId}`, {
        credentials: "include", // si tu utilises cookies JWT
        })
        .then((res) => {
            if (!res.ok) {
            if (res.status === 401) {
                // Session expirée → redirection
                window.location.href = "/profiles";
            }
            throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            // Assure-toi que data est un array
            if (Array.isArray(data)) {
            setDevices(data);
            } else {
            setDevices([]);
            }
        })
        .catch((err) => {
            console.error("Erreur devices:", err);
            setDevices([]);
        });
    }
}, [isOpen, profileId]);

  const handleEdit = (id, currentName) => {
    setEditingId(id);
    setNewName(currentName);
  };

  const handleSave = async (id) => {
    try {
      // PATCH /sessions/update pour modifier device_name
      await fetch(`${API_URL}/sessions/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceName: newName }),
      });

      setDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, device_name: newName } : d))
      );
      setEditingId(null);
    } catch (err) {
      console.error("Erreur modification device:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet appareil ?")) return;

    try {
      await fetch(`${API_URL}/sessions/delete/${id}`, {
        method: "DELETE",
      });

      setDevices((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Erreur suppression device:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[400px] max-w-full p-6">
        <h2 className="text-xl font-bold mb-4">Appareils connectés</h2>

        <div className="max-h-64 overflow-y-auto">
          {devices.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between mb-2 border-b pb-1"
            >
              {editingId === d.id ? (
                <>
                  <input
                    type="text"
                    className="border rounded px-2 py-1 flex-1 mr-2"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded mr-1"
                    onClick={() => handleSave(d.id)}
                  >
                    ✓
                  </button>
                  <button
                    className="bg-gray-300 px-2 py-1 rounded"
                    onClick={() => setEditingId(null)}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <span>{d.device_name || "Inconnu"}</span>
                  <div className="flex gap-1">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      onClick={() => handleEdit(d.id, d.device_name)}
                    >
                      ✎
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(d.id)}
                    >
                      🗑
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
