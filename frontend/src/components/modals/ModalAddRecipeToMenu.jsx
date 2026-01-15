import { useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { CLOUDINARY_RES, CLOUDINARY_RECETTE_NOTFOUND } from "../../config/constants";

export default function ModalAddRecipeToMenu({
  show,
  onClose,
  recipe,
  homeId,
  menus,
  setMenus,
  repasTags,
  setRepasTags,
  selectedMenuId,
  setSelectedMenuId,
  menuDate,
  setMenuDate,
  selectedMealTagId,
  setSelectedMealTagId,
  ingredients = null,
}) {
  if (!show || !recipe) return null;

  // 🔹 Récupérer tags repas
  async function fetchTagsRepas() {
    try {
      const res = await fetch(`${API_URL}/tag/get-childs?parent=Repas`);
      const data = await res.json();
      setRepasTags(data || []);
    } catch (err) {
      console.error("Erreur récupération tags (Repas) :", err);
    }
  }

  // 🔹 Récupérer menus existants
  async function fetchMenus() {
    try {
      const res = await fetch(`${API_URL}/menu/get-byHome?homeId=${homeId}`);
      const data = await res.json();
      setMenus(data || []);
    } catch (err) {
      console.error("Erreur récupération menus :", err);
    }
  }

  async function addToMenu() {
    const payload = selectedMenuId
      ? { menu_id: selectedMenuId, recipe_id: recipe.id }
      : {
          recipe_id: recipe.id,
          date: menuDate,
          home_id: homeId,
          tag_id: selectedMealTagId,
        };

    try {
      const url = selectedMenuId
        ? `${API_URL}/menu/add-recipe`
        : `${API_URL}/menu/create`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur ajout menu");

      alert("Recette ajoutée au menu !");
      // await refreshMenus();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Impossible d'ajouter la recette au menu.");
    }
  }

  useEffect(() => {
    fetchMenus();
    fetchTagsRepas();
  }, []);

  const repasParentId = repasTags.find(t => t.name === "Repas")?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          Ajouter {recipe.name} à un menu
        </h3>

        {menus.length > 0 ? (
          <>
            <label className="block mb-2">Choisir un menu existant :</label>
            <select
              className="w-full mb-4 p-2 border rounded"
              value={selectedMenuId || ""}
              onChange={(e) => setSelectedMenuId(e.target.value)}
            >
              <option value="">-- Nouveau menu --</option>
              {menus.map(m => (
                <option key={m.id} value={m.id}>
                  {m.date.slice(0, 10).split("-").reverse().join("/")} —{" "}
                  {m.tag.name}
                </option>
              ))}
            </select>
          </>
        ) : (
          <p className="mb-4">Aucun menu existant, créez-en un nouveau :</p>
        )}

        {!selectedMenuId && (
          <>
            <label className="block mb-2">Date du menu :</label>
            <input
              type="date"
              className="w-full mb-4 p-2 border rounded"
              value={menuDate}
              onChange={(e) => setMenuDate(e.target.value)}
            />

            <label className="block mb-2 font-semibold">Type de repas :</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {repasTags
                .filter(t => t.parent_id === repasParentId)
                .map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`px-3 py-1 rounded-full border ${
                      selectedMealTagId === tag.id
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 text-gray-700 border-gray-300"
                    }`}
                    onClick={() => setSelectedMealTagId(tag.id)}
                  >
                    {tag.name}
                  </button>
                ))}
            </div>
          </>
        )}

        {/* 🔹 Ingrédients manquants */}
{/* 🔹 Ingrédients manquants */}
{Array.isArray(ingredients) && ingredients.length > 0 && (
  <div className="mt-4">
    <p className="font-semibold mb-2">Ingrédients manquants :</p>

    <div className="flex gap-4 overflow-x-auto pb-3">
      {ingredients.map((ing) => (
        <div
          key={ing.id}
          className="flex flex-col items-center shrink-0 w-20"
        >
          <img
            src={`${CLOUDINARY_RES}${ing.picture || CLOUDINARY_RECETTE_NOTFOUND}`}
            alt={ing.name}
            className="w-12 h-12 object-cover mb-1"
          />
          <span className="text-xs text-center leading-tight break-words">
            {ing.name}
          </span>
        </div>
      ))}
    </div>
  </div>
)}



        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={addToMenu}
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
