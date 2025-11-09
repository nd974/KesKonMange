import React, { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ModalTransferProfile({ onClose, onTransferred }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    setError(null);
    setLoading(true);

    try {
      const home_id = localStorage.getItem("home_id");
      if (!home_id) {
        setError("Aucun home sélectionné. Reconnecte-toi.");
        setLoading(false);
        return;
      }

      if (!username.trim() || !password.trim()) {
        setError("Veuillez saisir le nom d'utilisateur et le mot de passe.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/profile/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
          home_id,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.error || "Impossible de transférer le profil.");
      } else {
        onTransferred && onTransferred();
        onClose();
      }
    } catch (err) {
      setError("Erreur réseau : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const canTransfer = username.trim() && password.trim();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-96 relative font-display">
        <h2 className="text-xl font-semibold mb-4 text-center">Transférer un profil existant</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{error}</div>
        )}

        <div className="flex flex-col gap-3">
          <input
            className="border border-gray-300 rounded px-3 py-2 bg-[#f3e6d9] text-gray-800 placeholder-gray-500"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="border border-gray-300 rounded px-3 py-2 bg-[#f3e6d9] text-gray-800 placeholder-gray-500"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleTransfer}
            disabled={!canTransfer || loading}
            className={`px-4 py-2 rounded ${
              canTransfer && !loading
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            } transition`}
          >
            {loading ? "Transfert..." : "Transférer"}
          </button>
        </div>
      </div>
    </div>
  );
}
