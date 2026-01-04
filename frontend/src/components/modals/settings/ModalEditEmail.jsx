import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ModalEditEmail({
  isOpen,
  onClose,
  home,
  profileId,
  emailCheck,
  onUpdated
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (home?.email) {
      setEmail(home.email);
    }
  }, [home]);

  if (!isOpen || !home) return null;

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

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
        setError(data.error || "Erreur inconnue");
        return;
      }

      onUpdated({
        ...home,
        email: data.email,
        email_check: false,
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError("Erreur réseau. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">

        {/* Icône fake Netflix (CSS only) */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center">
            <span className="text-pink-600 text-xl font-bold">✓</span>
          </div>
        </div>

        {/* Titre */}
        <h2 className="text-xl font-bold text-center mb-2">
          Vérifiez votre e-mail
        </h2>

        {/* Texte */}
        <p className="text-sm text-gray-600 text-center mb-5">
          Nous allons envoyer un lien de vérification à{" "}
          <span className="font-medium">{email}</span>.
          <br />
          Vérifier votre adresse e-mail permet de renforcer la sécurité
          de votre compte et de recevoir d’importantes communications.
        </p>

        {emailCheck && (
          <p className="text-sm text-green-600 text-center mb-3">
            ✅ Cet e-mail est déjà vérifié.
          </p>
        )}

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        {/* Boutons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded font-medium disabled:opacity-50"
          >
            {loading ? "Envoi en cours..." : "Envoyer un lien"}
          </button>

          <button
            className="w-full bg-gray-200 text-black py-3 rounded font-medium"
          >
            Modifier l’adresse e-mail
          </button>

          <button
            onClick={onClose}
            className="text-gray-600 text-sm"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
