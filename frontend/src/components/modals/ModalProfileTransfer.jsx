import React, { useState, useEffect } from "react";
import ModalWrapper from "./ModalWrapper";
import { getHomeId } from "../../../session";
import { useTransferProfile } from "../../hooks/useProfile";

export default function ModalProfileTransfer({ onClose, onTransferred }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [homeId, setHomeId] = useState(null);

  useEffect(() => {
    getHomeId().then(setHomeId);
  }, []);

  const transferProfile = useTransferProfile(homeId);

  const handleTransfer = () => {
    if (!username || !password) {
      setError("Nom d'utilisateur et mot de passe requis");
      return;
    }
    setError(null);

    transferProfile.mutate(
      { homeId, username, password },
      {
        onSuccess: () => {
          onTransferred?.();
          onClose?.();
        },
        onError: (err) => setError(err.message),
      }
    );
  };

  const canTransfer = username && password;

  return (
    <ModalWrapper onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4 text-center text-accentGreen">
        Transférer un profil
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm text-center">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 text-black">
        {/* Username */}
        <div className="flex flex-col gap-1">
          <label className="font-medium">Nom d'utilisateur :</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Nom d'utilisateur"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="font-medium">Mot de passe :</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Mot de passe"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleTransfer}
          disabled={!canTransfer || transferProfile.isLoading}
          className={`w-full px-4 py-2 rounded text-center ${
            canTransfer && !transferProfile.isLoading
              ? "bg-accentGreen text-white hover:bg-green-600"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          } transition`}
        >
          {transferProfile.isLoading ? "Transfert..." : "Transférer"}
        </button>
      </div>
    </ModalWrapper>
  );
}
