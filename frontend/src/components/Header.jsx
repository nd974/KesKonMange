import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate  } from "react-router-dom";
import { CLOUDINARY_RES, CLOUDINARY_LOGO_HEADER } from "../config/constants";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { setHomeId, getHomeId, getProfileId } from "../../session";

export default function Header({homeId}) {
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


  return (
    <header className="relative z-[1000] flex items-center gap-6">
      {/* 🔸 Logo + salutation */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-12 rounded-md bg-accentGreen flex items-center justify-center text-white font-bold">
          <img
            src={`${CLOUDINARY_RES}${CLOUDINARY_LOGO_HEADER}`}
            alt="Logo KesKonMange"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="hidden md:block">
          <div className="text-2xl font-bold" style={{ color: "#6b926f" }}>
            Bonjour {profile ? profile.name : ""} !
          </div>
        </div>
      </div>

      {/* 🔸 Navigation */}
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

      {/* 🔸 Sélecteur de Home */}
      <div className="ml-auto flex items-center gap-3 relative">
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


      {/* 🔸 Profil */}
      {/* <div
        className="w-10 h-10 rounded-md bg-accentGreen text-white flex items-center justify-center overflow-hidden cursor-pointer
                  hover:ring-2 hover:ring-white hover:ring-offset-2 hover:ring-offset-accentGreen transition-all"
        onClick={() => {navigate("/profiles");}}
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
      </div> */}

      <div className="relative" ref={profileMenuRef}>
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-md bg-accentGreen text-white flex items-center justify-center overflow-hidden cursor-pointer
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
        </div>

        {/* Dropdown */}
        {isProfileMenuOpen && (
          <div className="absolute right-0 top-14 w-48 bg-white rounded-xl shadow-lg border text-sm z-50">
            <ul className="py-2">
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => {navigate("/map");}}>
                {/* 📊 Base de données */}
                📊 Store Test
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => {navigate("/");}}>
                🏠 Gérer la maison
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => {navigate("/profiles");}}>
                🔄 Changer de profil
              </li>
              <li className="px-4 py-2 hover:bg-red-50 text-red-600 cursor-pointer" onClick={() => {navigate("/login");}}>
                🚪 Se déconnecter
              </li>
            </ul>
          </div>
        )}
      </div>




    </header>
  );
}
