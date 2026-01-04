import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ModalEditEmail({
  isOpen,
  onClose,
  home,
  profileId,
  emailCheck,
  onUpdated,
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (home?.email && isOpen) {
      setEmail(home.email);
      setError(null);
    }
  }, [home, isOpen]);

  if (!isOpen || !home) return null;

  const emailHasChanged = email !== home.email;

  // 📩 Envoyer un lien uniquement si l’e-mail n’a pas été modifié et non vérifié
  const canSendVerification = !emailHasChanged && !emailCheck;

  // ✏️ Modifier l’e-mail uniquement si le champ a changé
  const canEditEmail = emailHasChanged;

  // ✏️ Sauvegarde de l’email uniquement
  const handleUpdateEmail = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_URL}/home/updateEmail/${home.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la mise à jour");
        return;
      }

      onUpdated({
        ...home,
        email,
        email_check: false,
      });

    } catch {
      setError("Erreur réseau. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  // 📩 Envoi du lien de vérification
  const handleSendVerification = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_URL}/home/sendVerificationEmail/${home.id}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l’envoi du mail");
        return;
      }

      onClose();
    } catch {
      setError("Erreur réseau. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">

        {/* Icône */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center">
            <span className="text-pink-600 text-xl">📧</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center mb-2">
          Adresse e-mail
        </h2>

        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="Adresse e-mail"
        />

        {canSendVerification && (
          <p className="text-sm text-gray-600 text-center mb-4">
            Nous allons envoyer un lien de vérification à {email}. 
            Vérifier votre adresse e-mail permet de renforcer la sécurité de 
            votre compte et de vous aider à recevoir vos differents accès à KesKonMange.
          </p>
        )}

        {emailCheck && !emailHasChanged && (
          <p className="text-sm text-green-600 text-center mb-3">
            ✅ Cet e-mail est déjà vérifié.
          </p>
        )}

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">

          {/* ✏️ Modifier l’e-mail si champ modifié */}
          {canEditEmail && (
            <button
              onClick={handleUpdateEmail}
              disabled={loading}
              className="w-full border py-3 rounded font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              ✏️ Modifier l’e-mail
            </button>
          )}

          {/* 📩 Envoyer lien uniquement si email non modifié et non vérifié */}
          {canSendVerification && (
            <button
              onClick={handleSendVerification}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded font-medium disabled:opacity-50"
            >
              📩 Envoyer un lien
            </button>
          )}

          <button
            onClick={onClose}
            className="text-gray-600 text-sm"
          >
            {canEditEmail ? "Annuler" : "Quitter"}
          </button>
        </div>
      </div>
    </div>
  );
}
