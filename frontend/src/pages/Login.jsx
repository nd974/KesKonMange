import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CLOUDINARY_RES, CLOUDINARY_LOGO_HOME } from "../config/constants";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { setHomeId, getHomeId, setProfileId, getProfileId } from "../../session";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false); // Pour afficher la modal
  const navigate = useNavigate();

  useEffect(() => {
    setHomeId(0);
    setProfileId(0);
  }, []);

  const handleLogin = async () => {
    const res = await fetch(`${API_URL}/home/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.ok) {
      await setHomeId(data.homeId);
      console.log("Login [data.homeId]", data.homeId, "|", "await setHomeId(data.homeId)", await getHomeId());
      navigate("/profiles");
    } else {
      setMessage("❌ Email ou mot de passe incorrect");
    }
  };

  const handleCreateHome = async () => {
    const res = await fetch(`${API_URL}/home/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    setMessage(data.ok ? "✅ Compte créé !" : "❌ Erreur: " + data.error);
    if (data.ok) {
      setShowModal(false); // Fermer la modal après la création du compte
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#6b926f] text-white font-nunito">

      {/* === Logo === */}
      <img
        src={`${CLOUDINARY_RES}${CLOUDINARY_LOGO_HOME}`}
        alt="kskmg logo"
        className="w-56 md:w-64 mb-6 select-none"
        style={{
          filter: "drop-shadow(0 0 0 transparent)", // Enlève tout halo résiduel
        }}
      />

      {/* === Titre === */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-12 text-center">
        Bienvenue sur KesKonMange
      </h1>

      <input
        className="w-64 mb-3 p-2 rounded text-black"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-64 mb-5 p-2 rounded text-black"
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="text-black px-6 py-2 rounded mb-5 font-semibold"
        style={{ backgroundColor: '#e9dccb' }}
      >
        Se connecter
      </button>

      {/* Bouton pour ouvrir la modal */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-pink-200 text-black px-6 py-2 rounded font-semibold"
      >
        Créer un compte
      </button>

      {message && <p className="mt-4">{message}</p>}

      {/* === Modal pour créer une maison === */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-80">
            <h2 className="text-xl font-semibold mb-4 text-black text-center">Créer une nouvelle maison</h2>
            <input
              className="w-full mb-3 p-2 border rounded text-black"
              placeholder="Nom de la maison"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full mb-3 p-2 border rounded text-black"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full mb-5 p-2 border rounded text-black"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-between">
              <button
                onClick={handleCreateHome}
                className="bg-blue-500 text-white px-6 py-2 rounded"
              >
                Créer
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
