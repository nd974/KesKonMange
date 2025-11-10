import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalCreateProfile from "../components/ModalCreateProfile";
import ModalTransferProfile from "../components/ModalTransferProfile";
import { Repeat } from "lucide-react";
import { CLOUDINARY_RES, CLOUDINARY_LOGO_HOME } from "../config/constants";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProfileSelect() {
  const [profiles, setProfiles] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("profile_id");
    const homeId = localStorage.getItem("home_id");
    if (home_id) setUser(JSON.parse(home_id));
    else fetchUser();
    if (!homeId) return;

    fetch(`${API_URL}/profile/get?homeId=${homeId}`)
      .then((res) => res.json())
      .then((data) => setProfiles(data || []));
  }, []);

  const handleSelectProfile = (profileId) => {
    localStorage.setItem("profile_id", profileId);
    navigate("/"); // ✅ Après sélection du profil → dashboard
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#6b926f] text-white font-nunito">
      {/* === Logo === */}
      <img
        src={`${CLOUDINARY_RES}${CLOUDINARY_LOGO_HOME}`}
        alt="kskmg logo"
        className="w-56 md:w-64 mb-6 select-none"
        style={{
          filter: "drop-shadow(0 0 0 transparent)", // enlève tout halo résiduel
        }}
      />

      {/* === Titre === */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-12">
        Qui est-ce ?
      </h1>

      {/* === Profils === */}
      <div className="flex flex-wrap justify-center gap-10">
        {profiles.map((p) => (
          <div
            key={p.id}
            onClick={() => handleSelectProfile(p.id)}
            className="cursor-pointer flex flex-col items-center group"
          >
            <div className="w-28 h-28 bg-white text-black rounded-xl overflow-hidden flex items-center justify-center text-3xl font-bold group-hover:opacity-80 transition">
              {p.avatar ? (
                <img src={`${CLOUDINARY_RES}${p.avatar}`} className="w-full h-full object-cover" />
              ) : (
                p.name[0]?.toUpperCase()
              )}
            </div>
            <p className="mt-2 text-lg">{p.name}</p>
          </div>
        ))}

        {/* === Ajouter un profil === */}
        <div 
          onClick={() => setShowCreate(true)}
          className="group flex flex-col items-center cursor-pointer"
          >
          <div className="w-28 h-28 flex items-center justify-center rounded-xl border-2 border-transparent group-hover:border-white transition duration-200 bg-[#5e8263] text-white text-4xl font-bold">
              +
          </div>
          <p className="mt-2 text-lg font-semibold">Ajouter un profil</p>
        </div>

        <div 
          onClick={() => setShowTransfer(true)}
          className="group flex flex-col items-center cursor-pointer"
          >
          <div className="w-28 h-28 flex items-center justify-center rounded-xl border-2 border-transparent group-hover:border-white transition duration-200 bg-[#5e8263] text-white">
              <Repeat size={28} strokeWidth={2} className="translate-y-1" /> {/* ajustement vertical */}
          </div>
          <p className="mt-2 text-lg font-semibold">Transférer un profil</p>
        </div>
      </div>

      {/* === Logout === */}
      <button 
        onClick={() => {
            navigate("/login");
        }}
        className="mt-16 px-6 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-[#6b926f] transition">
            Changer de compte
      </button>

      {/* Modal */}
      {showCreate && (
        <ModalCreateProfile
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            window.location.reload(); // recharge pour voir le nouveau profil
          }}
        />
      )}

      {showTransfer && (
        <ModalTransferProfile
            onClose={() => setShowTransfer(false)}
            onTransferred={() => {
            setShowTransfer(false);
            window.location.reload();
            }}
        />
      )}
    </div>
  );
}