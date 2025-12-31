import HeaderAccount from "../../components/settings/SettingsHeader";
import SidebarAccount from "../../components/settings/SettingsSidebar";
import { Account_links } from "../../config/constants";

import React, { useEffect, useRef, useState } from "react";
import { setHomeId, getHomeId, getProfileId } from "../../../session";
import { CLOUDINARY_RES, CLOUDINARY_AVATARS_SETTINGS, CLOUDINARY_LOGO_HEADER, CLOUDINARY_LOGO_ACCOUNT } from "../../config/constants";

import ModalPickAvatar from "../../components/ModalPickAvatar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function User({ homeId, profileId }) {
    const [profile, setProfile] = useState(null);
    const [home, setHome] = useState(null);

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(null);

  const link = Account_links.find(
    item => item.label === '👤 Utilisateur'
  );

    useEffect(() => {
      const fetchDataProfile = async () => {
        // const homeId = await getProfileId();
        // const profileId = await getProfileId();
        if (profileId) {
            await fetch(`${API_URL}/profile/get/${profileId}`)
                .then((res) => res.json())
                .then((data) => setProfile(data))
                .catch((err) => console.error("Erreur profil:", err));
        }

        if (profile) {
          console.log(profile.home_id);
            await fetch(`${API_URL}/home/get/${profile.home_id}`)
                .then((res) => res.json())
                .then((data) => setHome(data))
                .catch((err) => console.error("Erreur profil:", err));
        }
      };
  
      fetchDataProfile();
    }, [profileId]);

    useEffect(() => {
      const fetchDataHome = async () => {
        if (profile) {
          console.log(profile.home_id);
            await fetch(`${API_URL}/home/get/${profile.home_id}`)
                .then((res) => res.json())
                .then((data) => setHome(data))
                .catch((err) => console.error("Erreur profil:", err));
        }
      };
  
      fetchDataHome();
    }, [profile]);

// console.log(profile.home_id);

  return (
    <div className="px-4 md:px-8 lg:px-16">
      {/* Header */}
      <HeaderAccount homeId={homeId} profileId={profileId}/>

      {/* Page */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-10">
        
        <SidebarAccount homeId={homeId}/>

        {/* Contenu principal */}
        <main className="flex-1">
            {/* Titre */}
            <h1 className="text-3xl font-bold mb-6">Utilisateur</h1>

            <p className="text-gray-600 mb-3">Modifiez votre profil </p>
            {/* Profile */}
            <div className="bg-white rounded-lg border mb-8 border p-3">
              
              {/* Avatar + Nom */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative w-24 h-24 rounded overflow-hidden">
                    {profile?.avatar ? (
                      <img
                        src={`${CLOUDINARY_RES}${selectedAvatar || profile.avatar}`}
                        alt="Profil"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                        <span>{profile?.username?.[0]?.toUpperCase() || ""}</span>
                    )}
                    <button
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xl"
                    >
                      ✎
                    </button>
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Nom</label>
                    <input
                    type="text"
                    defaultValue={profile?.name || ""}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>
              </div>

              {/* Alias */}
              <div className="mb-8">
                <label className="block text-sm font-medium mb-1">Pseudo</label>
                <p className="text-sm text-gray-600 mb-2">
                    Votre pseudo est un identifiant unique qui sera affiché en dehors de votre maison.
                    <span className="underline cursor-pointer ml-1">En savoir plus</span>
                </p>

                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">🆔</span>
                    <input
                    type="text"
                    defaultValue={profile?.username || ""}
                    className="w-full pl-10 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>
              </div>

              {/* Email */}
              <div className="mb-10">
                <label className="block text-sm font-medium mb-1">
                    Informations de la maison associée au profil
                </label>

                <div className="border rounded px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                    🏠
                    <span className="text-sm text-gray-700">
                        {home?.email || ""}
                    </span>
                    </div>
                    <span className="text-xl">›</span>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                    L'adresse e-mail associée à ce profil est également utilisée pour
                    l'accès au compte et la récupération de cet accès.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button className="bg-accentGreen text-white px-6 py-2 rounded font-medium">
                    Enregistrer
                </button>
              </div>
            </div>
        </main>

        {isAvatarModalOpen && (
          <ModalPickAvatar
              isOpen={isAvatarModalOpen}
              onClose={() => setIsAvatarModalOpen(false)}
              selectedAvatar={selectedAvatar || profile?.avatar}
              onSelectAvatar={setSelectedAvatar}
            />
        )}


      </div>
    </div>
  );
}
