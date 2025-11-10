import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ModalPickRecipe({ day, homeId, onPick, onClose }) {
  const [recipes, setRecipes] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState(new Set());
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");  // Ajout de l'état de recherche
  const isPast = day.isBefore(dayjs(), "day");

  // --- CHARGEMENT DES RECETTES ET TAGS ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // ✅ Charge les recettes
        const resRecipes = await fetch(`${API_URL}/recipe/get-all`);
        const recipesData = await resRecipes.json();

        // ✅ Charge les tags enfants du tag "Repas"
        const resTags = await fetch(`${API_URL}/tag/get-childs?parent=Repas`);
        const tagsData = await resTags.json();

        setRecipes(recipesData || []);
        setTags(tagsData || []);
      } catch (e) {
        console.error("Erreur chargement recettes/tags:", e);
        setRecipes([]);
        setTags([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- TOGGLE RECETTES ---
  const toggleRecipe = (id) => {
    setSelectedRecipeIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  // --- TOGGLE TAG UNIQUE ---
  const toggleTag = (id) => {
    setSelectedTagId((prev) => (prev === id ? null : id));
  };

  // --- FILTRAGE DES RECETTES PAR RECHERCHE ---
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- TRI DES RECETTES PAR LEVEL (DECROISSANT) ET LIMITATION À 10 ---
  const sortedAndLimitedRecipes = filteredRecipes
    .sort((a, b) => {
      // Assurez-vous que level est un entier et triez par ordre décroissant
      const levelA = parseInt(a.level, 10) || 0;  // Si level est invalid, mettre 0
      const levelB = parseInt(b.level, 10) || 0;  // Si level est invalid, mettre 0
      return levelB - levelA;  // Trier en ordre décroissant
    })
    .slice(0, 10); // Limite à 10 recettes

  // --- VALIDATION ---
  const handleValidate = async () => {
    if (isPast) return;

    const recipeIds = Array.from(selectedRecipeIds).map(Number);
    const tagId = selectedTagId ? Number(selectedTagId) : null;

    if (recipeIds.length === 0) {
      alert("Sélectionnez au moins une recette pour créer le menu.");
      return;
    }
    if (!tagId) {
      alert("Sélectionnez un tag (type de repas).");
      return;
    }
    if (!homeId) {
      alert("Erreur : aucun home sélectionné.");
      return;
    }

    const dateStr = day.format("YYYY-MM-DD");

    try {
      // ✅ Envoi au serveur PostgreSQL
      const resp = await fetch(`${API_URL}/menu/update-menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr, recipeIds, tagId, homeId }),
      });

      const result = await resp.json();
      if (!resp.ok) {
        throw new Error(result.error || "Erreur serveur");
      }

      // ✅ Informe le parent
      if (onPick) {
        onPick({
          date: dateStr,
          recipeIds,
          tagId,
          homeId,
        });
      }

      onClose();
    } catch (err) {
      console.error("Erreur lors de la création du menu:", err);
      alert("Erreur serveur : " + err.message);
    }
  };

  // --- HTML ---
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-11/12 max-w-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            Créer un menu pour le {day.format("DD/MM/YYYY")}
          </h2>
          <button onClick={onClose} className="text-sm text-gray-500">
            Fermer
          </button>
        </div>

        {isPast && (
          <div className="text-sm text-red-600 mb-3">
            Impossible d'ajouter un menu pour une date antérieure à aujourd'hui.
          </div>
        )}


        <div className="mb-3">
          <h3 className="font-semibold text-sm mb-2">Tags (Repas)</h3>
          <div className="flex flex-wrap gap-2">
            {loading ? (
              <div className="text-sm text-gray-500">Chargement...</div>
            ) : tags.length === 0 ? (
              <div className="text-sm text-gray-500">
                Aucun tag 'Repas' trouvé.
              </div>
            ) : (
              tags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTag(t.id)}
                  className={`px-2 py-1 text-sm rounded-full border ${
                    selectedTagId === t.id
                      ? "bg-softBeige text-green-900"
                      : "bg-white"
                  }`}
                >
                  {t.name}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="mb-4 py-8">
          <h3 className="font-semibold text-sm mb-2">Recettes</h3>

        {/* Barre de recherche pour les recettes */}
        <div className="mb-3">
        <input
            type="text"
            placeholder="Rechercher une recette..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-md"
        />
        </div>

          {loading ? (
            <div className="text-sm text-gray-500">Chargement...</div>
          ) : sortedAndLimitedRecipes.length === 0 ? (
            <div className="text-sm text-gray-500">Aucune recette trouvée.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-auto">
              {sortedAndLimitedRecipes.map((r) => {
                const selected = selectedRecipeIds.has(r.id);
                return (
                  <div
                    key={r.id}
                    onClick={() => toggleRecipe(r.id)}
                    className={`p-2 border rounded-md flex items-center gap-3 cursor-pointer ${
                      selected
                        ? "bg-accentGreen/10 border-accentGreen"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-gray-500">
                        {/* Affichage des étoiles en jaune */}
                        <span className="text-yellow-500">
                          {"★".repeat(parseInt(r.level) || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="w-6 h-6 flex items-center justify-center text-sm">
                      {selected ? "✓" : "+"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-md bg-gray-200"
          >
            Annuler
          </button>
          <button
            onClick={handleValidate}
            disabled={isPast}
            className={`py-2 px-4 rounded-md text-white ${
              isPast ? "bg-gray-300" : "bg-accentGreen"
            }`}
          >
            Valider ({selectedRecipeIds.size} sélectionnée
            {selectedRecipeIds.size > 1 ? "s" : ""})
          </button>
        </div>
      </div>
    </div>
  );
}
