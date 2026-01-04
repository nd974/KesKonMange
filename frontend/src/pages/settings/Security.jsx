import HeaderAccount from "../../components/settings/SettingsHeader";
import SidebarAccount from "../../components/settings/SettingsSidebar";
import SettingsActionItem from "../../components/settings/SettingsActionItem";
import { Account_links } from "../../config/constants";

import ModalEditEmail from "../../components/modals/settings/ModalEditEmail.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import React, { useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";

export default function Security({ homeId, profileId }) {

  const navigate = useNavigate();

  const alertShown = useRef(false);
  const params = new URLSearchParams(window.location.search);
  useEffect(() => {
    if (params.get("verified") === "200" && !alertShown.current) {
      alertShown.current = true;
      alert("✅ Adresse e-mail vérifiée avec succès");
      navigate("/settings/security", { replace: true });
    }
    else if (params.get("verified") === "410" && !alertShown.current) {
      alertShown.current = true;
      alert("⛔ Lien de vérification invalide ou expiré");
      navigate("/settings/security", { replace: true });
    }
    else if (params.get("verified") === "400" && !alertShown.current) {
      alertShown.current = true;
      alert("⛔ Token invalide invalide");
      navigate("/settings/security", { replace: true });
    }
    else if (params.get("verified") === "500" && !alertShown.current) {
      alertShown.current = true;
      alert("⛔ Erreur serveur lors de la vérification");
      navigate("/settings/security", { replace: true });
    }
  }, [navigate]);

const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "";

  const [local, domain] = email.split("@");
  const chars = local.split("");
  const result = chars.map(() => "*");

  // garder 3 premiers caractères
  for (let i = 0; i < 3 && i < chars.length; i++) {
    result[i] = chars[i];
  }

  // garder 2 chiffres consécutifs s'ils existent
  const digitIndex = local.search(/\d{2}/);
  if (digitIndex !== -1) {
    result[digitIndex] = local[digitIndex];
    result[digitIndex + 1] = local[digitIndex + 1];
  }

  return `${result.join("")}@${domain}`;
};

const maskPhone = (phone) => {
  if (!phone) return "Chargement ...";

  // Séparer l'indicatif et le reste du numéro sur le premier espace
  const [countryCode, nationalNumberRaw] = phone.split(' ');

  if (!countryCode || !nationalNumberRaw || nationalNumberRaw.length < 4) return phone;

  const number = nationalNumberRaw.replace(/\D/g, ''); // enlever les éventuels séparateurs
  const firstDigit = number[0];
  const lastTwo = number.slice(-2);
  const middleDigits = number.slice(1, -2);

  // Créer des blocs "••" pour chaque paire du milieu
  const blocks = [];
  for (let i = 0; i < middleDigits.length; i += 2) {
    blocks.push('••');
  }

  return `${countryCode} ${firstDigit} ${blocks.join(' ')} ${lastTwo}`;
};










  const maskPassword = (password) => {
    if (!password) return "Chargement ...";
    return "•".repeat(password.length); // longueur fixe pour la sécurité
  };

  const maskPin = (pin) => {
    if (!pin) return "Chargement ...";
    return "•".repeat(pin.length); // PIN toujours masqué
  };

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

  const [home, setHome] = useState(null);
  useEffect(() => {
    const fetchDataHome = async () => {
      if (profile) {
          await fetch(`${API_URL}/home/get/${profile.home_id}`)
              .then((res) => res.json())
              .then((data) => setHome(data))
              .catch((err) => console.error("Erreur profil:", err));
      }
    };

    fetchDataHome();
  }, [profile]);

  console.log("home = ", home);
  console.log("profile = ", profile);

  const [showEmailModal, setShowEmailModal] = useState(false);

  return (
    <div className="px-4 md:px-8 lg:px-16">
      <HeaderAccount homeId={homeId} profileId={profileId} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-10">
        <SidebarAccount homeId={homeId} />

        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-3">Sécurité</h1>

          <p className="text-gray-600 mb-3">Accès au compte associé</p>
          <div className="bg-white rounded-lg border mb-8 divide-y">
            <SettingsActionItem
              icon="📧"
              title=" E-mail"
              descriptions={[
                home?.email ? home.email : "Chargement...",
                // profile?.email_check ? home.email : "Chargement...",
                home?.email_check
                  ? "✅ Adresse vérifiée"
                  : "⛔ Vérification requise",
              ]}
              href={null}
              onClick={() => setShowEmailModal(true)}
            />
            <ModalEditEmail
              isOpen={showEmailModal}
              onClose={() => setShowEmailModal(false)}
              home={home}
              profileId={profileId}
              emailCheck={home?.email_check}
              onUpdated={(updatedHome) => {
                setHome(updatedHome);
                // setProfile(prev => ({
                //   ...prev,
                //   email_check: false, // reset après changement
                // }));
              }}
            />

            <SettingsActionItem
              icon="🔒"
              title="Mot de passe"
              descriptions={[
                maskPassword(home?.password ?? ""),
              ]}
              href={null}
              onClick={null}
            />
          </div>
          
          <p className="text-gray-600 mb-3">Accès a l'utilisateur</p>
          <div className="bg-white rounded-lg border mb-8 divide-y">
            <SettingsActionItem
              icon="🔢"
              title="Code PIN"
              descriptions={[
                maskPin(profile?.pin ?? ""),
              ]}
              href={null}
              onClick={null}
            />

            <SettingsActionItem
              icon="📱"
              title="Téléphone mobile"
              descriptions={[
                maskPhone(profile?.phone ?? ""),
                profile?.phone_check
                  ? "✅ Numéro vérifié"
                  : "⛔ Vérification requise",
              ]}
              href={null}
              onClick={null}
            />

            <SettingsActionItem
              icon="🛡️"
              title="Appareils connectés"
              descriptions={[
                "Gérer les appareils autorisés",
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
