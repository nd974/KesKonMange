import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { useCreateHome } from "../../hooks/useHome";
import { useAddressSearch } from "../../hooks/useHome";

export default function ModalHomeCreate({ onClose, onCreated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const [address, setAddress] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const createMutation = useCreateHome();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(address);
    }, 300);

    return () => clearTimeout(timer);
  }, [address]);

  const {
    data: suggestions = [],
    isFetching,
  } = useAddressSearch(debouncedQuery);

  
  const handleCreateHome = () => {
    setMessage("");

    createMutation.mutate(
      { email, password, name },
      {
        onSuccess: () => {
          setMessage("✅ Compte créé !");
          onCreated?.();
          onClose?.();
        },
        onError: (err) => {
          setMessage("❌ " + err.message);
        },
      }
    );
  };

  return (
    <ModalWrapper onClose={onClose}>
      <h2
        className="text-xl font-semibold mb-4 text-center"
        style={{ color: "#6b926f" }}
      >
        Créer une nouvelle maison
      </h2>

      {message && <p className="text-center mb-3">{message}</p>}

      <div className="flex flex-col gap-4 text-black">
        {/* Nom de la maison */}
        <div className="flex flex-col gap-1">
          <label className="font-medium">Nom de la maison :</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Nom de la maison"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="font-medium">Email :</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Mot de passe */}
        <div className="flex flex-col gap-1">
          <label className="font-medium">Mot de passe :</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Adresse */}
        <div className="flex flex-col gap-1 relative">
          <label className="font-medium">Adresse :</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Adresse"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          {isFetching && (
            <div className="text-sm text-gray-500 mt-1">
              Recherche de l’adresse…
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 max-h-40 overflow-auto border border-gray-200 rounded bg-white text-black mt-1">
              {suggestions.map((item) => (
                <div
                  key={item.place_id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setAddress(item.display_name);
                  }}
                >
                  {item.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bouton */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleCreateHome}
            disabled={createMutation.isLoading}
            className={`px-4 py-2 rounded ${
              !createMutation.isLoading
                ? "bg-green-200 text-green-900 hover:bg-green-300"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            } transition`}
          >
            {createMutation.isLoading ? "Création..." : "Créer"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
