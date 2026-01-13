import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CLOUDINARY_RES, CLOUDINARY_LOGO_HOME } from "../../config/constants";
import { setHomeId, setProfileId } from "../../../session";
import { useLoginHome, useCreateHome } from "../../hooks/useHome";

import ModalHomeCreate from "../../components/modals/ModalHomeCreate";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const loginMutation = useLoginHome();
  const createMutation = useCreateHome();

  useEffect(() => {
    setHomeId(0);
    setProfileId(0);
  }, []);

  const handleLogin = () => {
    setMessage("");

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: async (data) => {
          await setHomeId(data.homeId);
          navigate("/profiles");
        },
        onError: (err) => {
          setMessage("❌ " + err.message);
        },
      }
    );
  };

  const handleCreateHome = () => {
    setMessage("");

    createMutation.mutate(
      { email, password, name },
      {
        onSuccess: () => {
          setMessage("✅ Compte créé !");
          setShowModal(false);
        },
        onError: (err) => {
          setMessage("❌ " + err.message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#6b926f] text-white font-nunito">

      {/* Logo */}
      <img
        src={`${CLOUDINARY_RES}${CLOUDINARY_LOGO_HOME}`}
        alt="kskmg logo"
        className="w-56 md:w-64 mb-6 select-none"
      />

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
        disabled={loginMutation.isLoading}
        className="text-black px-6 py-2 rounded mb-5 font-semibold"
        style={{ backgroundColor: "#e9dccb" }}
      >
        {loginMutation.isLoading ? "Connexion..." : "Se connecter"}
      </button>

      <button
        onClick={() => setShowModal(true)}
        className="bg-pink-200 text-black px-6 py-2 rounded font-semibold"
      >
        Créer un compte
      </button>

      {message && <p className="mt-4">{message}</p>}

      {/* Modal création maison */}
      {showModal && (
        <ModalHomeCreate
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setMessage("✅ Maison créée !");
            setShowModal(false);
          }}
        />
      )}

    </div>
  );
}
