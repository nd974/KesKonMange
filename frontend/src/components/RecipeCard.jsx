import { CLOUDINARY_RECETTE_NOTFOUND, CLOUDINARY_RES } from "../config/constants";

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

export default function RecipeCard({ recipe }) {
  if (!recipe) return null;

  

  const allTags = window.__ALL_TAGS__ || [];
  const tags = Array.isArray(recipe.tags) ? recipe.tags : [];

  // 🔹 Trier les tags par profondeur (plus proches de la racine d’abord)
  const sortedTags = tags.sort((a, b) => {
    const depthA = getTagDepth(a.id, allTags);
    const depthB = getTagDepth(b.id, allTags);
    return depthA - depthB;
  });

  const visibleTags = sortedTags.slice(0, 4);
  const remaining = sortedTags.length - visibleTags.length;

  return (
    <div className="recipe-card border p-4 rounded-lg shadow hover:shadow-md transition bg-white">
      <img
        src={`${CLOUDINARY_RES}${recipe.picture || CLOUDINARY_RECETTE_NOTFOUND}`}
        alt={recipe.name}
        className="w-full h-40 object-cover rounded-md mb-2"
      />

      <h4 className="font-semibold text-lg mb-2 truncate">{recipe.name}</h4>

      {/* ✅ Afficher les tags uniquement s’il y en a */}
      
      {visibleTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {visibleTags.map((tag) => (
            <span
              key={tag.id}
              className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
            >
              {tag.name}
            </span>
          ))}

          {remaining > 0 && (
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
              +{remaining}
            </span>
          )}
        </div>
      )}

      {/* 🔹 Si aucun tag, pas d’espace vide, la ligne suivante monte */}
      <div
        className={`text-sm text-gray-500 flex justify-between items-center ${
          visibleTags.length > 0 ? "mt-2" : ""
        }`}
      >
        <span>prep: {recipe.time_prep} min</span>
        <span>|</span>
        <span>cook: {recipe.time_cook} min</span>
      </div>
    </div>
  );
}
