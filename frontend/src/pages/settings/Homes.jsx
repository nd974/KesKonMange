import HeaderAccount from "../../components/settings/SettingsHeader";
import SidebarAccount from "../../components/settings/SettingsSidebar";
import SettingsActionItem from "../../components/settings/SettingsActionItem";

import { useState, useEffect } from "react";
import HomeZone from "../../components/HomeZone";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Homes({ homeId, profileId }) {

    const [showPlanMaison, setShowPlanMaison] = useState(false);

const profiles = [
  {
    id: 1,
    name: "User1",
    image:
      "https://res.cloudinary.com/dz4ejk7r7/image/upload/v1764321145/avatar4_czjb1t_rxnryd.png",
    isMain: true,
  },
  {
    id: 2,
    name: "User2",
    image:
      "https://res.cloudinary.com/dz4ejk7r7/image/upload/v1764321145/avatar2_h6ubef_mwv7fb.png",
    isMain: false,
  },
  {
    id: 3,
    name: "User3",
    image:
      "https://res.cloudinary.com/dz4ejk7r7/image/upload/v1764321145/avatar3_ibhdeb_cy1r1v.png",
    isMain: false,
  },
  {
    id: 4,
    name: "User4",
    image:
      "https://res.cloudinary.com/dz4ejk7r7/image/upload/v1764321145/avatar4_czjb1t_rxnryd.png",
    isMain: false,
  },
  {
    id: 5,
    name: "User5",
    image:
      "https://res.cloudinary.com/dz4ejk7r7/image/upload/v1764321144/avatar1_enqee6_w8lagz.png",
    isMain: false,
  },
  {
    id: 6,
    name: "Invité",
    image:
      "https://res.cloudinary.com/dz4ejk7r7/image/upload/v1767285337/invite_x3jthx.webp",
    isMain: false,
  },
];

    const [homes, setHomes] = useState(false);

    useEffect(() => {
    const fetchHomes = async () => {
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
            })
            .catch((err) => console.error("Erreur homes:", err));
        }
    };

    fetchHomes();
    }, [homeId, profileId]);

    console.log("homes = ",homes);

    const [selectedHome, setSelectedHome] = useState(homes[0]);

    useEffect(() => {
        setSelectedHome(homes[0]);
    }, [homes]);

    console.log("selectedHome = ", selectedHome);

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
                <div className="mb-6">
                    {/* MOBILE */}
                    <div className="block md:hidden text-center">
                        <select
                        className="bg-softBeige pl-5 pr-3 py-1 rounded-xl text-sm"
                        value={selectedHome ? selectedHome.id : ""} // on stocke l'objet complet
                        onChange={(e) => {
                            const selected = homes.find(h => h.id === Number(e.target.value));
                            if (selected) setSelectedHome(selected);
                        }}
                        >
                        {homes.map((home) => (
                            <option key={home.id} value={home.id}>
                            {home.name}
                            </option>
                        ))}
                        </select>
                    </div>

                    {/* DESKTOP */}
                    <div className="hidden md:flex justify-center gap-3 flex-wrap">
                        {homes.map((home) => {
                        const isActive = selectedHome ? selectedHome.id === home.id : false ;
                        return (
                            <button
                            key={home.id}
                            onClick={() => setSelectedHome(home)}
                            className={`
                                px-4 py-2 rounded-full text-sm font-medium border
                                transition
                                ${
                                isActive
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
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


            <div className="bg-white rounded-lg border mb-8 divide-y">
                <SettingsActionItem
                icon="🗺️"
                title="Plan Maison"
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
    {profiles.map((profile) => (
      <div
        key={profile.id}
        className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
      >
        <div className="flex items-center gap-4">
          <img
            src={profile.image}
            alt={profile.name}
            className="w-10 h-10 rounded"
          />
          <p className="font-medium">{profile.name}</p>
        </div>

        <div className="flex items-center gap-3">
          {profile.isMain && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
              Votre profil
            </span>
          )}
          <span className="text-xl">›</span>
        </div>
      </div>
    ))}
  </div>

    {/* Zone fixe : bouton */}
    <div className="px-6 py-5 border-t">
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
                inManage={true}
                />
            </div>
            </div>
        </div>
        )}

    </div>
  );
}