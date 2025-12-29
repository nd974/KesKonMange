import HeaderAccount from "../../components/AccountHeader";
import SidebarAccount from "../../components/AccountSidebar";
import { Account_links } from "../../config/constants";

export default function Security({ homeId, profileId }) {

  const link = Account_links.find(
    item => item.label === '🔒 Sécurité'
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
          <h1 className="text-3xl font-bold mb-1">Sécurité</h1>
          <p className="text-gray-600 mb-6">Accès au compte</p>

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
