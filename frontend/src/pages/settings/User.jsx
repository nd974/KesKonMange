import HeaderAccount from "../../components/settings/SettingsHeader";
import SidebarAccount from "../../components/settings/SettingsSidebar";
import { Account_links } from "../../config/constants";

import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { setHomeId, getHomeId, getProfileId } from "../../../session";
import { CLOUDINARY_RES, CLOUDINARY_API, CLOUDINARY_RECETTE_NOTFOUND, CLOUDINARY_AVATARS_SETTINGS, CLOUDINARY_LOGO_HEADER, CLOUDINARY_LOGO_ACCOUNT } from "../../config/constants";

import ModalPickAvatar from "../../components/modals/ModalPickAvatar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function User({ homeId, profileId }) {
  const [profile, setProfile] = useState(null);
  const [home, setHome] = useState(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const location = useLocation();
  const targetProfileId = location.state?.targetProfileId || profileId;

  useEffect(() => {
    const fetchDataProfile = async () => {
      if (targetProfileId) {
          await fetch(`${API_URL}/profile/get/${targetProfileId}`)
              .then((res) => res.json())
              .then((data) => setProfile(data))
              .catch((err) => console.error("Erreur profil:", err));
      }
    };

    fetchDataProfile();
  }, [targetProfileId]);

  console.log(profile);

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

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setUsername(profile.username || "");
      setSelectedAvatar(profile.avatar || null);
    }
  }, [profile]);


  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          name,
          username,
          avatar: selectedAvatar,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setProfile(data.profile); // synchro UI
        alert("Profil mis à jour ✅");
        window.location.reload();
      } else {
        alert(data.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    }
  };

const handleUploadAvatar = async (profileId, file) => {
  if (!file || !profileId) return null;

  // Compression côté client


  const compressed = await compressImage(file);
  const fileToUpload = compressed || file;

  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("upload_preset", "Avatars");
  formData.append("public_id", `profile_avatar_${profileId}`); // 🔑 même public_id

  const res = await fetch(CLOUDINARY_API, { method: "POST", body: formData });
  const data = await res.json();

  if (data.secure_url) {
    const transformedUrl = data.secure_url.replace(
      "/upload/",
      "/upload/w_256,h_256,c_fill,f_webp,q_auto/"
    );
    return transformedUrl.split("/upload/w_256,h_256,c_fill,f_webp,q_auto/")[1];
  }

  return null;
};

const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  // url: v1770988112/abricot_urmvkl.webp
  const parts = url.split("/"); 
  const filename = parts[parts.length - 1]; // abricot_urmvkl.webp
  return filename.split(".")[0]; // abricot_urmvkl
};

const compressImage = (file, maxSize = 512, quality = 0.8) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = maxSize;
      canvas.height = maxSize;

      const ctx = canvas.getContext("2d");
      const startX = (img.width - size) / 2;
      const startY = (img.height - size) / 2;

      ctx.drawImage(img, startX, startY, size, size, 0, 0, maxSize, maxSize);

      canvas.toBlob((blob) => resolve(blob || file), "image/jpeg", quality);
    };
  });
};

const handleSelectAvatar = async (avatar) => {
  if (!avatar) return null;
  console.log("selectedAvatar:", selectedAvatar);
  if (avatar instanceof File) {
    console.log("DELETE new avatar...");
    // 🔹 Supprimer l'ancien avatar si c'était un avatar personnel
    if (selectedAvatar && selectedAvatar.split("/")[selectedAvatar.split("/").length - 1].startsWith("profile_avatar_")) {
      const oldPublicId = getPublicIdFromUrl(selectedAvatar);
      if (oldPublicId) {
        try {
          await fetch(`${API_URL}/profile/delete-avatar/${oldPublicId}`, {
            method: "DELETE",
          });
          console.log("Ancien avatar supprimé ✅");
        } catch (err) {
          console.error("Erreur suppression avatar:", err);
        }
      }
    }

    console.log("Uploading new avatar...");

    // 🔹 Upload nouveau avatar
    try {
      const compressed = await compressImage(avatar);
      const fileToUpload = compressed || avatar;

      const publicId = `profile_avatar_${profile.id}`;
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("upload_preset", "Avatars");
      formData.append("public_id", publicId);

      const res = await fetch(CLOUDINARY_API, { method: "POST", body: formData });
      const data = await res.json();

      if (data.public_id && data.version) {
        const transformedPath = `v${data.version}/${data.public_id}`;

        setSelectedAvatar(transformedPath);

        return transformedPath;
      }
    } catch (err) {
      console.error("Upload Cloudinary failed:", err);
      alert("Échec de l'upload. Vérifiez votre connexion.");
      return null;
    }
  } else {
    setSelectedAvatar(avatar);
    return avatar;
  }
};





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
            <h1 className="text-3xl font-bold mb-3">Utilisateur</h1>

            <p className="text-gray-600 mb-3">Modifiez le profil </p>
            {/* Profile */}
            <div className="bg-white rounded-lg border mb-8 border p-3">
              
              {/* Avatar + Nom */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative w-24 h-24 rounded overflow-hidden">
                    {/* {profile?.avatar && (
                      <img
                        src={`${CLOUDINARY_RES}${selectedAvatar || profile.avatar || CLOUDINARY_RECETTE_NOTFOUND}`}
                        alt="Profil"
                        className="object-cover w-full h-full"
                      />
                    )} */}
                    <img
                      src={`${CLOUDINARY_RES}${selectedAvatar || profile?.avatar || CLOUDINARY_RECETTE_NOTFOUND}`}
                      alt="Profil"
                      className="object-cover w-full h-full"
                    />
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
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>
              </div>

              {/* Alias */}
              <div className="mb-8">
                <label className="block text-sm font-medium mb-1">Pseudo</label>
                <p className="text-sm text-gray-600 mb-2">
                    Le pseudo est un identifiant unique qui sera affiché en dehors de la maison.
                    <span className="underline cursor-pointer ml-1">En savoir plus</span>
                </p>

                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">🆔</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
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
                <button
                  onClick={handleSave}
                  className="bg-accentGreen text-white px-6 py-2 rounded font-medium"
                >
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
              onSelectAvatar={handleSelectAvatar}
              profileId={profile?.id}
            />
        )}


      </div>
    </div>
  );
}
