import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CLOUDINARY_RES, CLOUDINARY_LOGO_HOME, CLOUDINARY_LOGO_ACCOUNT, CLOUDINARY_LOGO_HEADER } from "../../config/constants";
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
          setMessage("⛔ " + err.message);
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
  <div className="min-h-screen flex">

    {/* ===== LEFT — Desktop seulement ===== */}
    <div className="hidden md:flex md:w-1/2 bg-accentGreen text-white flex-col items-center justify-center px-12">
      
      <img
        src={`${CLOUDINARY_RES}${CLOUDINARY_LOGO_HOME}`}
        alt="KesKonMange logo"
        className="w-80 mb-6 select-none"
      />

      <p className="text-lg mb-10 text-center opacity-90">
        Organisez vos repas et vos courses en famille, simplement.
      </p>

      <ul className="space-y-6 text-xl text-left font-semibold">
        <li>🏠 Compte commun avec profils personnalisés</li>
        <li>📦 Gérez vos stocks alimentaires intelligemment</li>
        <li>📅 Créez des menus adaptés aux quantités nécessaires</li>
        <li>🛒 Générez automatiquement votre liste de courses</li>
        <li>🔍 Trouvez des recettes selon vos ingrédients disponibles</li>
      </ul>
    </div>


    {/* ===== RIGHT SIDE ===== */}
    <div className="flex flex-1 items-center justify-center">
      
      <div className="w-full max-w-md p-6 mt-20">

        {/* ===== LOGO MOBILE ONLY ===== */}
        <div className="md:hidden flex justify-center mb-4">
          <img
            src={`${CLOUDINARY_RES}${CLOUDINARY_LOGO_ACCOUNT}`}
            alt="KesKonMange logo"
            className="w-80 object-contain select-none"
          />
        </div>

        {/* ===== FORM ===== */}

        <label className="font-semibold">Email</label>
        <input
          className="w-full mb-4 mt-2 p-4 border rounded-xl bg-gray-100"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex justify-between items-center">
          <label className="font-semibold">Mot de passe</label>
          <span className="text-softPink font-semibold text-sm cursor-pointer" onClick={() => alert("Fonctionnalité à venir !")}>
            Mot de passe oublié ?
          </span>
        </div>

        <input
          className="w-full mb-6 mt-2 p-4 border rounded-xl bg-gray-100"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && <p className="mb-6 text-white bg-red-700 p-2 rounded-lg">{message}</p>}

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-4 rounded-xl font-semibold mb-6"
        >
          {loginMutation.isLoading ? "Connexion..." : "Se connecter"}
        </button>


        {/* ===== OU ===== */}
        <div className="flex items-center mb-6">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="px-3 text-gray-500">ou</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>


        {/* ===== Google BUTTON ===== */}
        <button
          className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white py-4 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
          onClick={() => alert("Fonctionnalité à venir !")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-5 h-5"
          >
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.7 6.5 29.1 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.5-.2-3-.9-4.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.4 16.1 18.8 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C33.7 6.5 29.1 4.5 24 4.5 16 4.5 9.2 9.1 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 45.5c5.2 0 9.6-2 12.9-5.3l-6-4.9C29 37.1 26.7 38 24 38c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.1 40.8 16 45.5 24 45.5z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.7-3 5-5.4 6.6l6 4.9C39.5 35.7 44.5 31 44.5 25c0-1.5-.2-3-.9-4.5z"/>
          </svg>

          Google
        </button>


        <p className="text-center mt-6 text-gray-500">
          Vous n'avez pas de compte ?{" "}
          <span className="text-softPink font-semibold cursor-pointer" onClick={() => setShowModal(true)}>
            S'inscrire
          </span>
        </p>

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
    </div>
  </div>
);
}
