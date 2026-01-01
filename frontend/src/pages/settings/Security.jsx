import HeaderAccount from "../../components/settings/SettingsHeader";
import SidebarAccount from "../../components/settings/SettingsSidebar";
import SettingsActionItem from "../../components/settings/SettingsActionItem";
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
    <div className="px-4 md:px-8 lg:px-16">
      <HeaderAccount homeId={homeId} profileId={profileId} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-10">
        <SidebarAccount homeId={homeId} />

        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-3">Sécurité</h1>
          <p className="text-gray-600 mb-3">Accès au compte utilisateur</p>

          <div className="bg-white rounded-lg border mb-8 divide-y">
            <SettingsActionItem
              icon="🔒"
              title="Mot de passe"
              descriptions={[
                "",
              ]}
              href={null}
              onClick={null}
            />

            <SettingsActionItem
              icon="🔢"
              title="Code PIN"
              descriptions={[
                "",
              ]}
              href={null}
              onClick={null}
            />

            <SettingsActionItem
              icon="📧"
              title=" E-mail"
              descriptions={[
                "nicolas974dolphin@gmail.com",
                "⛔ Vérification requise",
              ]}
              href={null}
              onClick={null}
            />

            <SettingsActionItem
              icon="📱"
              title="Téléphone mobile"
              descriptions={[
                "07 70 14 58 77",
                "✅ Vérification validée"
              ]}
              href={null}
              onClick={null}
            />

            <SettingsActionItem
              icon="🛡️"
              title="Appareils connectés"
              descriptions={[
                "",
              ]}
              href={null}
              onClick={null}
            />
          </div>

        </main>
      </div>
    </div>
  );
}
