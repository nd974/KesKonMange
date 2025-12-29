import HeaderAccount from "../../components/settings/SettingsHeader";
import SidebarAccount from "../../components/settings/SettingsSidebar";
import SecurityItem from "../../components/settings/SettingsSecurityItem";
import { Account_links } from "../../config/constants";

export default function Security({ homeId, profileId }) {

  const securityLink = Account_links.find(
    item => item.label.includes("Sécurité")
  );

  // ⚠️ À remplacer par ton vrai state / API
  const userSecurityData = {
    email: {
      value: "nicolas974dolphin@gmail.com",
      verified: false,
    },
    phone: {
      value: "07 70 14 58 77",
      verified: true,
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16">
      <HeaderAccount homeId={homeId} profileId={profileId} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-10">
        <SidebarAccount homeId={homeId} />

        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-4">Sécurité</h1>
          <p className="text-gray-600 mb-6">Accès au compte utilisateur</p>

          <div className="bg-white rounded-lg border divide-y">

            {securityLink.items.map((item, index) => {

              // 📧 EMAIL
              if (item.label.includes("E-mail")) {
                return (
                  <SecurityItem
                    key={index}
                    label={item.label}
                    value={userSecurityData.email.value}
                    verified={userSecurityData.email.verified}
                  />
                );
              }

              // 📱 TÉLÉPHONE
              if (item.label.includes("Téléphone")) {
                return (
                  <SecurityItem
                    key={index}
                    label={item.label}
                    value={userSecurityData.phone.value}
                    verified={userSecurityData.phone.verified}
                  />
                );
              }

              // 🔒 AUTRES (mot de passe, futur items, etc.)
              return (
                <div
                  key={index}
                  className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xl">›</span>
                </div>
              );
            })}

          </div>
        </main>
      </div>
    </div>
  );
}
