import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";

import { useUpdateProfilePin } from "../../hooks/useProfile";

export default function ModalPin({ profile, onClose, handleSelectProfile = null }) {
  const [pin, setPin] = useState(profile?.pin && !handleSelectProfile ? String(profile.pin).padStart(6, "0") : "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const pinIsValid = /^\d{6}$/.test(pin);

  // hook pour update le PIN
  const updatePinMutation = useUpdateProfilePin(profile.home_id);

  const handleSubmit = () => {
    setMessage("");

    if (!pinIsValid) {
      setMessage("Le code PIN doit contenir 6 chiffres");
      return;
    }

    if (handleSelectProfile) {
      // connexion avec PIN
      console.log("Comparaison PIN:", pin, " | ", profile.pin);
      if (pin !== String(profile.pin)) {
        setMessage("❌ Code PIN incorrect");
        return;
      }
      handleSelectProfile(profile.id);
    } else {
      // mise à jour du PIN via le hook
      setLoading(true);
      updatePinMutation.mutate(
        { profileId: profile.id, pin },
        {
          onSuccess: () => {
            setLoading(false);
            onClose();
          },
          onError: (err) => {
            setLoading(false);
            setMessage(err.message || "Erreur lors de la mise à jour du PIN");
          },
        }
      );
      window.location.reload();
    }
  };

  const handleReset = () => {
    setMessage("");
    setLoading(true);
    updatePinMutation.mutate(
      { profileId: profile.id, pin: null },
      {
        onSuccess: () => {
          setPin("");
          setLoading(false);
          onClose();
        },
        onError: (err) => {
          setLoading(false);
          setMessage(err.message || "Erreur lors de la réinitialisation du PIN");
        },
      }
    );
    window.location.reload();
  };

  return (
    <ModalWrapper onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4 text-center" style={{ color: "#6b926f" }}>
        {handleSelectProfile ? "Code PIN requis" : "Modifier le code PIN"}
      </h2>

      <p className="text-center mb-4 text-black">
        Profil : <strong>{profile.name}</strong>
      </p>

      {message && <p className="text-center mb-3 text-red-500">{message}</p>}

      <div className="flex flex-col gap-4 text-black">
        <div className="flex flex-col gap-1">
          <label className="font-medium">Code PIN (6 chiffres)</label>
          <input
            type={handleSelectProfile ? "password" : "text"}
            inputMode="numeric"
            maxLength={6}
            className={`w-full rounded px-3 py-2 border-2 ${
              pin.length === 0 ? "border-gray-300" : pinIsValid ? "border-accentGreen" : "border-softPink"
            }`}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ""));
              setMessage("");
            }}
            placeholder="••••••"
          />
        </div>

        <div className="flex justify-end mt-4 gap-2">
          {!handleSelectProfile && profile?.pin && (
            <button
              onClick={handleReset}
              disabled={loading || updatePinMutation.isLoading}
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
            >
              {loading || updatePinMutation.isLoading ? "Traitement..." : "Désactiver le PIN"}
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={!pinIsValid || loading || updatePinMutation.isLoading}
            className={`px-4 py-2 rounded ${
              pinIsValid && !loading && !updatePinMutation.isLoading
                ? "bg-green-200 text-green-900 hover:bg-green-300"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            } transition`}
          >
            {loading || updatePinMutation.isLoading
                ? "Traitement..."
                : handleSelectProfile
                ? "Valider"
                : !profile.pin
                ? "Sauvegarder"
                : "Modifier"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
