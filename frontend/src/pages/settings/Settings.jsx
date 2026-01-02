import HeaderAccount from "../../components/settings/SettingsHeader";
import SidebarAccount from "../../components/settings/SettingsSidebar";
import { Account_links } from "../../config/constants";

import { useNavigate, useLocation } from "react-router-dom";

export default function Settings({ homeId, profileId }) {

  const navigate = useNavigate();

  const link = Account_links.find(
    item => item.label === '📄 Général'
  );

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
          <h1 className="text-3xl font-bold mb-3">Général</h1>

          <p className="text-gray-600 mb-3">Détails de la maison sélectionnée</p>
          {/* maisons */}
          <div className="bg-white rounded-lg border mb-6">
            <div className="px-6 py-4 border-b">
              <div className="ml-auto mr-6 flex items-center gap-3 relative">
                {/* 🔸 Sélecteur de Home */}
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                  🏠
                </span>
                <p className="bg-softBeige pl-9 pr-3 py-1 rounded-xl text-sm sm:block">André Malraux</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-2">
              <h2 className="font-semibold text-lg">47 rue André Malraux, 45100, Orléans, FRANCE</h2>
              <p className="text-sm text-gray-600">
                Prochain paiement : <strong>17 janvier 2026</strong>
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                💳 •••• •••• •••• 7455
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => navigate("/settings/homes")}>
              <span className="font-medium">Gérer la maison</span>
              <span className="text-xl">›</span>
            </div>
          </div>

          <p className="text-gray-600 mb-3">Liens rapides</p>
          <div className="bg-white rounded-lg border divide-y">
            {link.items.map((item, index) => (
              <div
                key={index}
                className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-xl">›</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
