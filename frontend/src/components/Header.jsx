import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate  } from "react-router-dom";
import { CLOUDINARY_RES, CLOUDINARY_LOGO_HEADER, CLOUDINARY_LOGO_ACCOUNT } from "../config/constants";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { setHomeId, getHomeId, getProfileId } from "../../session";

export default function Header({homeId, inAccount=false}) {
    const location = useLocation();
    const navigate = useNavigate();
    const profileMenuRef = useRef(null);

    const [profile, setProfile] = useState(null);
    const [homes, setHomes] = useState([]);
    const [selectedHome, setSelectedHome] = useState(null);

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const links = [
    { name: "Dashboard", path: "/" },
    { name: "Recettes", path: "/recipes" },
    { name: "Calendrier", path: "/calendar" },
    { name: "Garde manger", path: "/stock" },
    { name: "Listes de courses", path: "/shopping_list" },
    ];

  // 🔹 Fetch du profil logué
  useEffect(() => {
    const fetchData = async () => {
      const profileId = await getProfileId();
      if (profileId) {
          fetch(`${API_URL}/home/get/${profileId}`)
              .then((res) => res.json())
              .then((data) => setProfile(data))
              .catch((err) => console.error("Erreur profil:", err));
      }
    };

    fetchData();
  }, []);


  // 🔹 Fetch des homes liés au profil logué
  useEffect(() => {
    const fetchHomes = async () => {
      const profileId = await getProfileId();
      if (profileId) {
        const currentHomeId = parseInt(homeId, 10);
        fetch(`${API_URL}/home/homes-get/${profileId}`)
          .then((res) => res.json())
          .then((data) => {
            const sortedHomes = data.sort((a, b) => {
              if (a.id === currentHomeId) return -1;
              if (b.id === currentHomeId) return 1;
              return 0;
            });
            setHomes(sortedHomes);
            setSelectedHome(sortedHomes.find((h) => h.id === currentHomeId));
          })
          .catch((err) => console.error("Erreur homes:", err));
      }
    };

    fetchHomes();
  }, [homeId]);


  // 🔹 Changement de home dans le menu déroulant
  const handleChangeHome = async (event) => {
    const newHomeId = event.target.value;
    setSelectedHome(homes.find((h) => h.id === parseInt(newHomeId)));
    // localStorage.setItem("home_id", newHomeId);
    await setHomeId(newHomeId);
    window.location.reload(); // recharge la page pour appliquer le changement
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Nouvelle connexion", read: false },
    { id: 2, text: "Alex s’est inscrit au menu Lasagnes", read: false },
    { id: 3, text: "Menu de la semaine mis à jour", read: true },
    { id: 4, text: "Menu de la semaine mis à jour", read: false },
    { id: 5, text: "Menu de la semaine mis à jour", read: false },
    { id: 6, text: "Menu de la semaine mis à jour", read: false },
    { id: 7, text: "Menu de la semaine mis à jour", read: false },
    { id: 8, text: "Menu de la semaine mis à jour", read: false },
    { id: 9, text: "Menu de la semaine mis à jour", read: false },
    { id: 10, text: "Menu de la semaine mis à jour", read: false },
    { id: 11, text: "Menu de la semaine mis à jour", read: false },
    { id: 12, text: "Menu de la semaine mis à jour", read: false },
    { id: 13, text: "Menu de la semaine mis à jour", read: false },
  ]);
  const unreadNotifications = notifications.filter(n => !n.read);


  return (
    <header className={`relative flex items-center w-full ${inAccount && "mb-4"}`}>
      {/* 🔸 Logo + salutation */}
      <div className={`${inAccount ? "w-1/4 justify-center" : ""} flex items-center gap-3`}>
        <div className={`${inAccount ? "w-40 h-16" : "w-11 h-12"} flex items-center justify-center text-white font-bold`}>
          <img
            src={`${CLOUDINARY_RES}${inAccount ? CLOUDINARY_LOGO_ACCOUNT : CLOUDINARY_LOGO_HEADER}`}
            alt="Logo KesKonMange"
            className="object-cover w-full h-full"
          />
        </div>

        {!inAccount && (
          <div className="hidden md:block">
            <div className="text-2xl font-bold" style={{ color: "#6b926f" }}>
              Bonjour {profile ? profile.name : ""} !
            </div>
          </div>
        )}
      </div>



      {!inAccount && (
        <nav className="ml-6 hidden lg:flex gap-6 text-sm text-gray-600">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-1 rounded-md transition ${
                location.pathname === link.path
                  ? "bg-pink-100 text-gray-900 font-medium"
                  : "hover:bg-gray-100"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      )}


{!inAccount && (
  <div className="ml-auto mr-6 flex items-center gap-3 relative">
    {/* 🔸 Sélecteur de Home */}
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
      🏠
    </span>

    <select
      value={selectedHome?.id || ""}
      onChange={handleChangeHome}
      className="bg-softBeige pl-9 pr-3 py-1 rounded-xl text-sm sm:block"
    >
      {homes.map((home) => (
        <option key={home.id} value={home.id}>
          {home.name}
        </option>
      ))}
    </select>
  </div>
)}




      {/* 🔸 Profil */}
<div className={`${inAccount ? "w-2/3 justify-end" : ""} flex items-center`}>
  <div className="relative" ref={profileMenuRef}>
    {/* Avatar */}
    <div
      className="relative w-10 h-10 rounded-md bg-accentGreen text-white flex items-center justify-center overflow-hidden cursor-pointer
                hover:ring-2 hover:ring-white hover:ring-offset-2 hover:ring-offset-accentGreen transition-all"
      onClick={() => setIsProfileMenuOpen((prev) => !prev)}
    >
      {profile?.avatar ? (
        <img
          src={`${CLOUDINARY_RES}${profile.avatar}`}
          alt="Profil"
          className="object-cover w-full h-full"
        />
      ) : (
        <span>{profile?.username?.[0]?.toUpperCase() || "?"}</span>
      )}

      {/* 🔔 Badge notification */}
      {unreadNotifications.length > 0 && (
        <span className="absolute -bottom-0.5 -right-0.5 bg-red-500 text-white text-[10px] 
                        w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
          {unreadNotifications.length}
        </span>
      )}
    </div>


    {/* Dropdown */}
    {isProfileMenuOpen && (
      <div className="absolute right-0 top-14 w-64 bg-white rounded-xl shadow-lg border text-sm z-50">
        <ul className="py-2 max-h-60 overflow-auto">

          {/* Menu existant */}
          {inAccount && (
            <li
              className="px-4 py-2 hover:bg-accentGreen cursor-pointer text-white bg-accentGreen"
              onClick={() => navigate("/")}
            >
              ← Retour KesKonMange
            </li>
          )}

          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => navigate("/settings")}>
            ⚙️ Paramètres
          </li>
          <li
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            onClick={() => {
              setIsNotifOpen(true);
              setIsProfileMenuOpen(false);
            }}
          >
            🔔 Notifications
            {unreadNotifications.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadNotifications.length}
              </span>
            )}
          </li>
          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => navigate("/profiles")}>
            🔄 Changer de profil
          </li>
          <li className="px-4 py-2 hover:bg-red-50 text-red-600 cursor-pointer" onClick={() => navigate("/login")}>
            🚪 Se déconnecter
          </li>
        </ul>
      </div>
    )}

    {isNotifOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-lg">🔔 Notifications</h2>
          <button
            onClick={() => setIsNotifOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Contenu */}
        <div className="max-h-80 overflow-auto">
          {unreadNotifications.length > 0 ? (
            unreadNotifications.map((notif) => (
              <div
                key={notif.id}
                className="px-4 py-3 border-b hover:bg-gray-50"
              >
                {notif.text}
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-gray-400">
              Aucune notification non lue 🎉
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 py-3 border-t">
          <button
            className="text-sm text-accentGreen hover:underline"
            onClick={() => {
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
              );
              setIsNotifOpen(false);
            }}
          >
            Tout marquer comme lu
          </button>
        </div>
      </div>
    </div>
  )}


  </div>
</div>





    </header>
  );
}
