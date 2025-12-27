import { Link, useLocation, useNavigate  } from "react-router-dom";

import Header from "../../components/Header";

export default function Account({ homeId, profileId }) {

    const navigate = useNavigate();

    const location = useLocation();

    const tabs = [
    { label: "Présentation", path: "/account" },
    { label: "Maisons", path: "/account/homes" },
    { label: "Sécurité", path: "/account/security" },
    { label: "Profils", path: "/account/profiles" },
    ];


  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16">
      {/* Header */}
      <div className="bg-white sticky top-0 z-[9999] py-8">
        <Header homeId={homeId} inAccount={true}/>

        <br></br>

                {/* Navigation mobile */}
        <div className="md:hidden border-b bg-white">
            <div className="flex gap-6 px-4 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                const isActive = location.pathname === tab.path;

                return (
                    <button
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    className={`relative py-4 text-sm whitespace-nowrap font-medium
                        ${isActive ? "text-black" : "text-gray-500 hover:text-black"}
                    `}
                    >
                    {tab.label}

                    {isActive && (
                        <span className="absolute left-0 bottom-0 w-full h-[3px] bg-accentGreen rounded-full" />
                    )}
                    </button>
                );
                })}
            </div>
        </div>
      </div>




      {/* Page */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-10">
        
        {/* Sidebar */}
        <aside className="w-64 hidden md:block">
          <button className="flex items-center gap-2 text-sm text-gray-600 mb-6 hover:underline" onClick={() => navigate("/")}>
            ← Retour sur KesKonMange
          </button>

          <nav className="space-y-4 text-sm">
            <button className="flex items-center gap-3 font-semibold text-black" onClick={() => navigate("/account")}>
              📄 Présentation
            </button>

            <div className="flex items-center gap-3 text-gray-600 hover:text-black cursor-pointer" onClick={() => navigate("/account")}>
              💳 Maisons
            </div>

            <div className="flex items-center gap-3 text-gray-600 hover:text-black cursor-pointer" onClick={() => navigate("/account")}>
              🔒 Sécurité
            </div>

            <div className="flex items-center gap-3 text-gray-600 hover:text-black cursor-pointer" onClick={() => navigate("/account")}>
              👥 Profils
            </div>

            <div className="flex items-center gap-3 text-gray-600 hover:text-black cursor-pointer" onClick={() => navigate("/shops")}>
              ⏳ TMP STORE
            </div>

            <div className="flex items-center gap-3 text-gray-600 hover:text-black cursor-pointer" onClick={() => navigate("/account")}>
              ⏳ TMP OPENFACTFOOD
            </div>
          </nav>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1">
          {/* Titre */}
          <h1 className="text-3xl font-bold mb-1">Compte</h1>
          <p className="text-gray-600 mb-6">Détails de l'abonnement</p>

          {/* Carte abonnement */}
          <div className="bg-white rounded-lg border mb-8">
            <div className="px-6 py-4 border-b">
              <span className="inline-block bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Abonnement débuté en mai 2021
              </span>
            </div>

            <div className="px-6 py-5 space-y-2">
              <h2 className="font-semibold text-lg">Offre Standard</h2>
              <p className="text-sm text-gray-600">
                Prochain paiement : <strong>17 janvier 2026</strong>
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                💳 •••• •••• •••• 7455
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-between items-center cursor-pointer hover:bg-gray-50">
              <span className="font-medium">Gérer l'abonnement</span>
              <span className="text-xl">›</span>
            </div>
          </div>

          {/* Liens rapides */}
          <h2 className="font-semibold text-lg mb-3">Liens rapides</h2>

          <div className="bg-white rounded-lg border divide-y">
            {[
              "Changer d'offre",
              "Gérer votre mode de paiement",
              "Acheter une option abonné supplémentaire",
              "Gérer les accès et les appareils",
              "Mettre à jour le mot de passe",
            ].map((item, index) => (
              <div
                key={index}
                className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
              >
                <span className="font-medium">{item}</span>
                <span className="text-xl">›</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
