import React, { useState } from "react";
import { CLOUDINARY_AVATAR5_DEFAULT } from "../config/constants";

export default function ModalCreateProfile({ onClose, onCreated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [roleId, setRoleId] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    setError(null);
    setLoading(true);

    try {
      const home_id = localStorage.getItem("home_id"); // clé telle que stockée précédemment
      if (!home_id) {
        setError("Aucun home sélectionné. Reconnecte-toi.");
        setLoading(false);
        return;
      }

      // validations client
      if (!username.trim() || !password.trim() || !name.trim()) {
        setError("Les champs Nom d'utilisateur, Mot de passe et Nom sont obligatoires.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/profile/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
          name: name.trim(),
          avatar,
          role_id: roleId,
          home_id,
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        setError(data.error || "Erreur lors de la création du profil.");
      } else {
        onCreated && onCreated();
        onClose();
      }
    } catch (e) {
      setError(e.toString());
    } finally {
      setLoading(false);
    }
  };

  const canCreate = username.trim() && password && name.trim();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-96 relative font-display">
        <h2 className="text-xl font-semibold mb-4 text-center">Créer un profil</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{error}</div>
        )}

        <div className="flex flex-col gap-3">
          <input
            className="border border-gray-300 rounded px-3 py-2 bg-[#f3e6d9] text-gray-800 placeholder-gray-500"
            placeholder="Nom d'utilisateur (unique)"
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
          <input
            className="border border-gray-300 rounded px-3 py-2 bg-[#f3e6d9] text-gray-800 placeholder-gray-500"
            placeholder="Nom dans le foyer (ex: Bonjour Dad)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <p className="text-sm text-gray-600 mt-2 mb-1">Avatar :</p>
          <div className="grid grid-cols-5 gap-2">
            {CLOUDINARY_AVATAR5_DEFAULT.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`rounded-full p-1 transition border-2 ${avatar === a ? "border-green-600" : "border-transparent"} hover:scale-105`}
              >
                <img src={a} alt="avatar" className="rounded-full w-14 h-14 object-cover" />
              </button>
            ))}
          </div>

          <select
            className="border border-gray-300 rounded px-3 py-2 bg-[#f3e6d9] text-gray-800"
            value={roleId}
            onChange={(e) => setRoleId(Number(e.target.value))}
          >
            <option value={1}>Admin</option>
            <option value={2}>Member</option>
            <option value={3}>Guest</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition">Annuler</button>
          <button
            onClick={handleCreate}
            disabled={!canCreate || loading}
            className={`px-4 py-2 rounded ${canCreate && !loading ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-300 text-gray-600 cursor-not-allowed"} transition`}
          >
            {loading ? "Création..." : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
