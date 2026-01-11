import { CLOUDINARY_RECETTE_NOTFOUND, CLOUDINARY_RES } from "../config/constants";
import { FullStar, HalfStar, EmptyStar } from "../components/Stars";
import ModalAddRecipeToMenu from "../components/modals/ModalAddRecipeToMenu";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function RecipeCard({ recipe , homeId}) {
  console.log("recipe ================", recipe);
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
  const sortedTags = [...tags].reverse();
  const visibleTags = sortedTags.slice(0, 2);
  const hiddenTags = sortedTags.slice(2, sortedTags.length);
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

  async function loadRating(id) {
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
    } catch (e) {
      console.error("Erreur loadRating:", e);
    }
  }

  useEffect(() => {
    loadRating(recipe.id);
  }, [recipe.id]); // Add recipe.id to dependency array for rerun on recipe change
  
  return (
    <div
      className="recipe-card border p-4 rounded-lg shadow hover:shadow-md transition bg-gray-100"
      onClick={() => {
        if (!showAddToMenuModal) navigate(`/new_recipe_details/${recipe.id}`);
      }}
    >
    <div className="relative">
      <img
        src={`${CLOUDINARY_RES}${recipe.picture || CLOUDINARY_RECETTE_NOTFOUND}`}
        alt={recipe.name}
        className="w-full h-40 object-cover rounded-md mb-2"
      />

      {/* Bouton Ajouter au menu */}
      <button
        className="absolute top-2 right-2 text-blue-600 hover:text-blue-800 bg-white/80 rounded-full p-1 shadow"
        title="Ajouter au menu"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedRecipe(recipe);
          setShowAddToMenuModal(true);
        }}
      >
        📝
      </button>

      {/* ⭐ Étoiles en bas à droite */}
      {votesCount > 0 && (
        <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 rounded shadow flex items-center gap-1 text-yellow-500 text-sm">
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


      <h4 className="font-semibold text-lg truncate">{recipe.name}</h4>

      {/* ✅ Afficher les tags uniquement s’il y en a */}
      {visibleTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 relative">
          {visibleTags.map((tag) => (
            <span
              key={tag.id}
              className="tags"
            >
              {tag.name}
            </span>
          ))}

          {remaining > 0 && (
            <div className="relative group">
              <span className="tags bg-gray-200 px-2 py-1">
                +{remaining}
              </span>

              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-max bg-gray-800 text-white text-[10px] rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
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
        {recipe?.note > -1 && recipe?.note !==null && (
          <div className="flex items-center gap-2 mt-2">
            <p>Ma note :</p>
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => {
                const starNum = i + 1;

                if (starNum <= Math.floor(recipe?.note)) return <FullStar key={i} color="accentGreen" size={0.5}/>;
                if (starNum - 1 < recipe?.note && recipe?.note < starNum) return <HalfStar key={i} color="accentGreen" size={0.5}/>;
                return <EmptyStar key={i} color="accentGreen" size={1}/>;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Add to Menu */}
      {showAddToMenuModal && (
        <ModalAddRecipeToMenu
          show={showAddToMenuModal}
          onClose={() => setShowAddToMenuModal(false)}
          recipe={selectedRecipe}
          homeId={homeId}
          menus={menus}
          setMenus={setMenus}
          repasTags={repasTags}
          setRepasTags={setRepasTags}
          selectedMenuId={selectedMenuId}
          setSelectedMenuId={setSelectedMenuId}
          menuDate={menuDate}
          setMenuDate={setMenuDate}
          selectedMealTagId={selectedMealTagId}
          setSelectedMealTagId={setSelectedMealTagId}
        />
      )}
    </div>
  );
}
