import HeaderAccount from "../../components/settings/SettingsHeader";
import SidebarAccount from "../../components/settings/SettingsSidebar";
import SettingsActionItem from "../../components/settings/SettingsActionItem";

import { useState, useEffect } from "react";
import HomeZone from "../../components/HomeZone";

import { useNavigate, useLocation } from "react-router-dom";

import { CLOUDINARY_RES, CLOUDINARY_LOGO_HOME } from "../../config/constants";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";



export default function Homes({ homeId, profileId }) {

    const navigate = useNavigate();

    const [showPlanMaison, setShowPlanMaison] = useState(false);

    const [homes, setHomes] = useState(false);

    const [profile, setProfile] = useState(null);
    useEffect(() => {
      const fetchDataProfile = async () => {
        if (profileId) {
            await fetch(`${API_URL}/profile/get/${profileId}`)
                .then((res) => res.json())
                .then((data) => setProfile(data))
                .catch((err) => console.error("Erreur profil:", err));
        }
      };
  
      fetchDataProfile();
    }, [profileId]);

    console.log("profile",profile);

useEffect(() => {
  const fetchHomes = async () => {
    if (!profile) return;

    const currentHomeId = parseInt(homeId, 10);

    const url =
      profile.role_id === 1
        ? `${API_URL}/home/get-all/${profile.id}`
        : `${API_URL}/home/homes-get/${profile.id}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const sortedHomes = data.sort((a, b) => {
        if (a.id === currentHomeId) return -1;
        if (b.id === currentHomeId) return 1;
        return 0;
      });

      setHomes(sortedHomes);
    } catch (err) {
      console.error("Erreur homes:", err);
    }
  };

  fetchHomes();
}, [profile, homeId]);


    console.log("homes = ",homes);

    const [selectedHome, setSelectedHome] = useState(homes[0]);

    useEffect(() => {
        setSelectedHome(homes[0]);
    }, [homes]);

    console.log("selectedHome = ", selectedHome);

    const [profiles, setProfiles] = useState([]);

    useEffect(() => {
      // 2️⃣ Charger les profils
      if (!selectedHome) return;
      fetch(`${API_URL}/home/get-profiles?homeId=${selectedHome.id}`)
        .then((res) => res.json())
        .then((data) => setProfiles(data || []));
    }, [selectedHome]);

    console.log("profiles = ",profiles);

    const [isPrimaryHome, setIsPrimaryHome] = useState(false);
    useEffect(() => {
      setIsPrimaryHome(profile?.home_id === selectedHome?.id);
    }, [profile?.home_id, selectedHome?.id]);

    const handleTogglePrimary = () => {
      if (selectedHome?.id === profile?.home_id) {
        alert("Veuillez choisir une autre maison pour changer l'association.");
        return;
      }
      else{
        // setIsPrimaryHome(!isPrimaryHome);
        alert("TODO");
        return;
        
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
            <h1 className="text-3xl font-bold mb-3">Maisons</h1>
            {/* Sélecteur de maison */}
            {homes && homes.length > 0 && (
                <div className="mb-3">
                    {/* MOBILE */}
                    <div className="block md:hidden flex justify-center items-center relative">
                      {/* 🔸 Sélecteur de Home avec icône */}
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                          🏠
                        </span>

                        <select
                          value={selectedHome ? selectedHome.id : ""}
                          onChange={(e) => {
                            const selected = homes.find(h => h.id === Number(e.target.value));
                            if (selected) setSelectedHome(selected);
                          }}
                          className="bg-softBeige pl-9 pr-3 py-1 rounded-xl text-sm sm:block"
                        >
                          {homes.map((home) => (
                            <option key={home.id} value={home.id}>
                              {home.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* DESKTOP */}
                    <div className="hidden md:flex justify-center gap-3 flex-wrap">
                      {homes.map((home) => {
                        const isActive = selectedHome?.id === home.id;
                        const isPrimary = profile?.home_id === home.id;
                        const isLinked = home.is_linked;

                        return (
                          <button
                            key={home.id}
                            onClick={() => setSelectedHome(home)}
                            className={`
                              px-4 py-2 rounded-full text-sm font-medium border transition
                              ${!isLinked && profile?.role_id===1
                                ? "bg-gray-200 text-gray-400 border-gray-300 hover:bg-gray-300"
                                : isPrimary
                                  ? isActive
                                    ? "bg-green-700 text-white border-green-700"
                                    : "bg-green-200 text-green-800 border-green-300 hover:bg-green-300"
                                  : isActive
                                    ? "bg-blue-700 text-white border-blue-700"
                                    : "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-300"
                              }
                            `}
                          >
                            {home.name}
                          </button>
                        );
                      })}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg border mb-3 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">
                  Maison associé
                </p>
              </div>

              {/* Toggle */}
<button
  onClick={handleTogglePrimary}
  className={`
    relative inline-flex h-6 w-11 items-center rounded-full transition
    ${selectedHome?.id === profile?.home_id ? "bg-accentGreen cursor-not-allowed" : isPrimaryHome ? "bg-accentGreen" : "bg-gray-300"}
  `}
>
  <span
    className={`
      inline-block h-4 w-4 transform rounded-full bg-white transition
      ${isPrimaryHome ? "translate-x-6" : "translate-x-1"}
    `}
  />
</button>

            </div>


            <div className="bg-white rounded-lg border mb-6 divide-y">
                <SettingsActionItem
                icon="🗺️"
                title="Plan"
                descriptions={[
                    "",
                ]}
                href={null}
                onClick={() => setShowPlanMaison(true)}
                />

                {/* <SettingsActionItem
                icon="👤"
                title="Transférer un profil"
                descriptions={[
                    "",
                ]}
                href={null}
                onClick={null}
                /> */}

                <SettingsActionItem
                icon="🏠"
                title="Ajouter Maison"
                descriptions={[
                    "",
                ]}
                href={null}
                onClick={null}
                />

            </div>

            {/* Paramètres de profil */}
            <h2 className="font-semibold text-lg mb-3">Paramètres de profil</h2>

<div className="bg-white rounded-lg border">
  {/* Zone scrollable : profils uniquement */}
  <div className="divide-y max-h-[220px] overflow-y-auto">
    {profiles.map((p) => (
      <div
        key={p.id}
        onClick={() =>
          navigate("/settings/user", {
            state: { targetProfileId: p.id }
          })
        }
        className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
      >
        <div className="flex items-center gap-4">
          <img
            src={`${CLOUDINARY_RES}${p.avatar}`}
            alt={p.name}
            className="w-10 h-10 rounded"
          />
          <p className="font-medium">{p.name}</p>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          {p.id === profileId && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
              Votre profil
            </span>
          )}
          {/* {p.home_id === selectedHome?.id && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
              Associé
            </span>
          )} */}
          <span className="text-xl">›</span>
        </div>
      </div>
    ))}
  </div>

    {/* Zone fixe : bouton */}
    <div className="px-6 py-4 border-t">
        <div className="flex flex-col md:flex-row gap-2">
            <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-medium hover:bg-gray-300">
            Ajouter un profil
            </button>
            <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-medium hover:bg-gray-300">
            Transférer un profil
            </button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
            Ajoutez/Transférez jusqu'à 5 profils (hors invité) pour les personnes qui vivent avec vous.
        </p>
    </div>


</div>


        </main>

      </div>

      {showPlanMaison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            {/* Contenu de la popin */}
            <div className="bg-white rounded-lg w-full lg:w-1/3 max-w-5xl max-h-[90vh] overflow-hidden shadow-lg">
            
            {/* Header popin */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
                <button
                onClick={() => setShowPlanMaison(false)}
                className="text-gray-500 hover:text-gray-800 text-xl"
                >
                ✕
                </button>
            </div>

            {/* Contenu */}
            <div className="p-6 overflow-y-auto">
                <HomeZone
                key={selectedHome.id}
                homeId={selectedHome.id}
                homeName={selectedHome.name}
                inManage={true}
                />
            </div>
            </div>
        </div>
        )}

    </div>
  );
}