import { CLOUDINARY_RECETTE_NOTFOUND, CLOUDINARY_RES } from "../config/constants";
import { FullStar, HalfStar, EmptyStar } from "../components/Stars";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Calcule la profondeur d’un tag dans la hiérarchie.
 */
function getTagDepth(tagId, tagsFlat = []) {
  let depth = 0;
  let current = tagsFlat.find((t) => t.id === tagId);
  while (current && current.parent_id) {
    depth++;
    current = tagsFlat.find((t) => t.id === current.parent_id);
  }
  return depth;
}

export default function RecipeCard({ recipe , homeId}) {
  const navigate = useNavigate();

  if (!recipe) return null;

  // const allTags = window.__ALL_TAGS__ || [];
  const tags = Array.isArray(recipe.tags) ? recipe.tags : [];

  // 🔹 Trier les tags par profondeur (plus proches de la racine d’abord)
  // const sortedTags = tags.sort((a, b) => {
  //   const depthA = getTagDepth(a.id, allTags);
  //   const depthB = getTagDepth(b.id, allTags);
  //   return depthB - depthA;
  // });
  console.log("tags",tags);
  const sortedTags = [...tags].reverse();
  console.log("sortedTags", sortedTags);
  const visibleTags = sortedTags.slice(0, 4);
  const hiddenTags = sortedTags.slice(4, sortedTags.length);
  const remaining = sortedTags.length - visibleTags.length;

  const [averageNote, setAverageNote] = useState(0);
  const [votesCount, setVotesCount] = useState(0); // Add this state for votes count

  // Modal add to menu
  const [showAddToMenuModal, setShowAddToMenuModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [menus, setMenus] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [menuDate, setMenuDate] = useState("");
  const [selectedMealTagId, setSelectedMealTagId] = useState([]);
  const [repasTags, setRepasTags] = useState([]);

  // Récupérer tags repas
  async function fetchTagsRepas() {
    try {
      const repasTags = await fetch(`${API_URL}/tag/get-childs?parent=Repas`);
      const resTags = await repasTags.json();
      setRepasTags(resTags || []);
    } catch (err) {
      console.error("Erreur récupération tags (Repas) :", err);
    }
  }

  // Récupérer menus existants
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
    if (!selectedRecipe) return;
    const payload = selectedMenuId
      ? { menu_id: selectedMenuId, recipe_id: selectedRecipe.id }
      : { recipe_id: selectedRecipe.id, date: menuDate, home_id: homeId,  tag_id: selectedMealTagId};

    try {
      const url = selectedMenuId ? `${API_URL}/menu/add-recipe` : `${API_URL}/menu/create`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erreur ajout menu");

      setShowAddToMenuModal(false);
      alert("Recette ajoutée au menu !");
    } catch (err) {
      console.error(err);
      alert("Impossible d'ajouter la recette au menu.", err);
    }
  }

  async function loadRating(id) {
    console.log("loadRating for recipe id:", id);
    if (!id) return;
    try {
      const res = await fetch(`${API_URL}/recipe/getRating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: id }),
      });
      const data = await res.json();
      if (data.ok) {
        setAverageNote(data.averageNote);
        setVotesCount(data.votesCount); // Set votes count
      }
      console.log("loadRating data:", data);
    } catch (e) {
      console.error("Erreur loadRating:", e);
    }
  }

  useEffect(() => {
    loadRating(recipe.id);
  }, [recipe.id]); // Add recipe.id to dependency array for rerun on recipe change
  
  return (
    <div
      className="recipe-card border p-4 rounded-lg shadow hover:shadow-md transition bg-white"
      onClick={() => {
        if (!showAddToMenuModal) navigate(`/recipe/${recipe.id}`);
      }}
    >
      <div className="relative">
        <img
          src={`${CLOUDINARY_RES}${recipe.picture || CLOUDINARY_RECETTE_NOTFOUND}`}
          alt={recipe.name}
          className="w-full h-40 object-cover rounded-md mb-2"
        />

        {/* Bouton positionné en haut à droite */}
        <button
          className="absolute top-2 right-2 text-blue-600 hover:text-blue-800 bg-white/80 rounded-full p-1 shadow"
          title="Ajouter au menu"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRecipe(recipe);
            setShowAddToMenuModal(true);
            fetchMenus(); // Pour lister les menus existants
            fetchTagsRepas();  // Pour lister les tags enfants de Repas
          }}
        >
          📝
        </button>

      </div>

      <h4 className="font-semibold text-lg truncate">{recipe.name}</h4>

      {/* ✅ Afficher les tags uniquement s’il y en a */}
      {visibleTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 relative">
          {visibleTags.map((tag) => (
            <span
              key={tag.id}
              className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
            >
              {tag.name}
            </span>
          ))}

          {remaining > 0 && (
            <div className="relative group">
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs cursor-pointer">
                +{remaining}
              </span>

              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-max bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                {hiddenTags.map((tag) => tag.name).join(", ")}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🔹 Si aucun tag, pas d’espace vide, la ligne suivante monte */}
      <div
        className={`text-sm text-gray-500 flex justify-between items-center ${
          visibleTags.length > 0 ? "mt-2" : ""
        }`}
      >

        {/* 🔹 Affichage des étoiles (note) */}
        {votesCount > 0 && (
          <div className="flex items-center gap-2 mt-2 text-yellow-500">
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => {
                const starNum = i + 1;

                if (starNum <= Math.floor(averageNote)) return <FullStar key={i} />;
                if (starNum - 1 < averageNote && averageNote < starNum) return <HalfStar key={i} />;
                return <EmptyStar key={i} />;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Add to Menu */}
      {showAddToMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Ajouter {selectedRecipe?.name} à un menu</h3>

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
                      {m.date.slice(0, 10).split('-').reverse().join('/')} -- {m.tag.name}
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

                {/* ✅ Sélection d’un seul tag enfant de "Repas" */}
                <label className="block mb-2 font-semibold">Type de repas :</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(repasTags
                    .filter(t => t.parent_id === repasTags.find(tag => tag.name === "Repas")?.id)
                    || []).map(tag => (
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

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowAddToMenuModal(false)}
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
      )}
    </div>
  );
}
