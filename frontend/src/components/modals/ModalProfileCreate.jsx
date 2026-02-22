import React, { useState, useEffect } from "react";
import ModalWrapper from "./ModalWrapper";
import { CLOUDINARY_AVATAR5_DEFAULT, CLOUDINARY_RES } from "../../config/constants";
import { getHomeId } from "../../../session";
import { useCreateProfile } from "../../hooks/useProfile";

export default function ModalProfileCreate({ onClose, onCreated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [roleId, setRoleId] = useState(2);
  const [error, setError] = useState(null);
  const [homeId, setHomeId] = useState(null);

  useEffect(() => {
    getHomeId().then(setHomeId);
  }, []);

  const createProfile = useCreateProfile(homeId);

  const handleCreate = () => {
    if (!username || !password || !name) {
      setError("Tous les champs sont obligatoires");
      return;
    }
    setError(null);
    createProfile.mutate(
      { homeId, username, password, name, avatar, roleId },
      {
        onSuccess: () => {
          onCreated?.();
          onClose?.();
        },
        onError: (err) => setError(err.message),
      }
    );
  };

  const canCreate = username && password && name;

  return (
    <ModalWrapper onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4 text-center text-accentGreen">
        Créer un profil
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

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="font-medium">Nom dans le foyer :</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Nom dans le foyer"
          />
        </div>

        {/* Avatar */}
        <div className="flex flex-col gap-1">
          <label className="font-medium">Avatar :</label>
          <div className="grid grid-cols-5 gap-4">
            {CLOUDINARY_AVATAR5_DEFAULT.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(avatar === a ? null : a)}
                className={`box-border border-4 rounded-2xl overflow-hidden transition ${
                  avatar === a ? "border-accentGreen" : "border-transparent"
                }`}
              >
                <img
                  src={`${CLOUDINARY_RES}${a}`}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Role */}
        {/* <div className="flex flex-col gap-1">
          <label className="font-medium">Rôle :</label>
          <select
            value={roleId}
            onChange={(e) => setRoleId(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value={2}>Member</option>
          </select>
        </div> */}

        {/* Submit */}
        <button
          onClick={handleCreate}
          disabled={!canCreate || createProfile.isLoading}
          className={`w-full px-4 py-2 rounded text-center ${
            canCreate && !createProfile.isLoading
              ? "bg-accentGreen text-white hover:bg-green-600"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          } transition`}
        >
          {createProfile.isLoading ? "Création..." : "Créer"}
        </button>
      </div>
    </ModalWrapper>
  );
}
