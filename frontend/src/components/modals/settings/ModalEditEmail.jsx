import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ModalEditEmail({ isOpen, onClose, home, profileId, emailCheck, onUpdated }) {
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

    if (!email) {
      setError("Veuillez saisir une adresse e-mail.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/home/updateEmail/${home.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId, email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        // 🔥 message backend affiché
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
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">Modifier l’e-mail</h2>

        {emailCheck && (
        <p className="text-sm text-green-600 mb-3">
          ✅ Cet e-mail est déjà vérifié.
        </p>)}

        <p className="text-sm text-gray-500 mb-3">
          Un email de vérification sera envoyé après modification. <br />
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-2"
        />

        {/* 🔴 ALERTE */}
        {error && (
          <div className="mb-3 p-3 text-sm text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}


        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
