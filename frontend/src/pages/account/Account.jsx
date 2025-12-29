import HeaderAccount from "../../components/AccountHeader";
import SidebarAccount from "../../components/AccountSidebar";
import { Account_links } from "../../config/constants";

export default function Security({ homeId, profileId }) {

  const link = Account_links.find(
    item => item.label === '📄 Compte'
  );

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16">
      {/* Header */}
      <HeaderAccount homeId={homeId} profileId={profileId}/>

      {/* Page */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-10">
        
        <SidebarAccount homeId={homeId}/>

        {/* Contenu principal */}
        <main className="flex-1">
          {/* Titre */}
          <h1 className="text-3xl font-bold mb-1">Compte</h1>
          <p className="text-gray-600 mb-6">Détail au compte</p>

          {/* Carte abonnement
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
          </div> */}

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
