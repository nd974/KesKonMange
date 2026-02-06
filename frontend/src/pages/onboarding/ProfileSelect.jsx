import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Repeat } from "lucide-react";

import ModalCreateProfile from "../../components/modals/ModalProfileCreate";
import ModalTransferProfile from "../../components/modals/ModalProfileTransfer";
import ModalProfilePin from "../../components/modals/ModalProfilePin";

import { CLOUDINARY_RES, CLOUDINARY_LOGO_HOME } from "../../config/constants";
import {
  refreshHomeId,
  refreshProfileId,
  setProfileId,
  getProfileId,
} from "../../../session";

import { useGetProfiles } from "../../hooks/useProfile";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProfileSelect({ homeId }) {
  const navigate = useNavigate();

  const [showCreate, setShowCreate] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const { data: profiles = [], isLoading } = useGetProfiles(homeId);

  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // nettoyage session profil
  const currentProfileId = getProfileId();
  if (currentProfileId) {
    setProfileId(0);
  }

  refreshHomeId();
  refreshProfileId();

  const handleSelectProfile = async (profileId) => {
    try {
      const res = await fetch(`${API_URL}/sessions/create`, {
        method: "POST",
        credentials: "include", // cookie HTTP-only
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });

      if (!res.ok) throw new Error("Erreur création session");

      // ✅ attend que la réponse soit OK avant de setter le profileId
      setProfileId(profileId);

      // Navigue après que le cookie soit créé
      navigate("/");

    } catch (err) {
      console.error("Erreur création session:", err);
    }
  };



  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#6b926f] text-white font-nunito">
      {/* === Logo === */}
      <img
        src={`${CLOUDINARY_RES}${CLOUDINARY_LOGO_HOME}`}
        alt="kskmg logo"
        className="w-56 md:w-64 mb-6 select-none py-6"
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
            onClick={() => {
              if (p.pin) {
                setSelectedProfile(p);
                setShowPinModal(true);
              } else {
                handleSelectProfile(p.id);
              }
            }}
            className="cursor-pointer flex flex-col items-center group"
          >
            <div className="w-28 h-28 bg-white text-black rounded-xl overflow-hidden flex items-center justify-center text-3xl font-bold group-hover:opacity-80 transition">
              {p.avatar ? (
                <img
                  src={`${CLOUDINARY_RES}${p.avatar}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                p.name?.[0]?.toUpperCase()
              )}
            </div>
            <p className="mt-2 text-lg">{p.name}</p>
          </div>
        ))}

        {/* === Ajouter === */}
        <div
          onClick={() => setShowCreate(true)}
          className="group flex flex-col items-center cursor-pointer"
        >
          <div className="w-28 h-28 flex items-center justify-center rounded-xl border-2 border-transparent group-hover:border-white transition bg-[#5e8263] text-white text-4xl font-bold">
            +
          </div>
          <p className="mt-2 text-lg font-semibold">Ajouter</p>
        </div>

        {/* === Transférer === */}
        <div
          onClick={() => setShowTransfer(true)}
          className="group flex flex-col items-center cursor-pointer"
        >
          <div className="w-28 h-28 flex items-center justify-center rounded-xl border-2 border-transparent group-hover:border-white transition bg-[#5e8263] text-white">
            <Repeat size={28} strokeWidth={2} />
          </div>
          <p className="mt-2 text-lg font-semibold">Transférer</p>
        </div>
      </div>

      {/* === Logout === */}
      <button
        onClick={() => navigate("/login")}
        className="mt-16 px-6 py-3 bg-transparent border-2 border-white rounded-full font-bold hover:bg-white hover:text-[#6b926f] transition"
      >
        Changer de compte
      </button>

      {/* === Modals === */}
      {showCreate && (
        <ModalCreateProfile
          onClose={() => setShowCreate(false)}
          onCreated={() => setShowCreate(false)}
        />
      )}

      {showTransfer && (
        <ModalTransferProfile
          onClose={() => setShowTransfer(false)}
          onTransferred={() => setShowTransfer(false)}
        />
      )}

      {showPinModal && selectedProfile && (
        <ModalProfilePin
          profile={selectedProfile}
          onClose={() => {
            setShowPinModal(false);
            setSelectedProfile(null);
          }}
          handleSelectProfile={handleSelectProfile}
        />
      )}
    </div>
  );
}
