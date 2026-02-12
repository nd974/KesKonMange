import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
import { CLOUDINARY_RES, CLOUDINARY_ICONS } from "../config/constants";

import ModalAddRecipeToMenu from "../components/modals/ModalAddRecipeToMenu";

export default function RecipePossible({ homeId, profileId }) {
  const [recipesOk, setRecipesOk] = useState([]);
  const [recipesPossible, setRecipesPossible] = useState([]);

  const [showAddToMenuModal, setShowAddToMenuModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState(null);
  // états requis par la modale
  const [menus, setMenus] = useState([]);
  const [repasTags, setRepasTags] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [menuDate, setMenuDate] = useState("");
  const [selectedMealTagId, setSelectedMealTagId] = useState(null);

  const GAP_CARD = 20;
  const MAX_DISPLAY = 20;

  const GardeMangerLink = () => (
  <a
    href="/stock"
    className="text-green-600 underline hover:text-green-800"
  >
    Garde-manger
  </a>
  );

  const ShoppingListLink = () => (
  <a
    href="/shopping_list"
    className="text-green-600 underline hover:text-green-800"
  >
    Listes de courses
  </a>
  );

  useEffect(() => {
    if (!homeId) return;

    const loadRecipes = async () => {
      try {
        const res = await fetch(`${API_URL}/recipe/get-possible`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ homeId }),
        });

        if (!res.ok) throw new Error("Erreur chargement recettes");

        const data = await res.json();

        // 🔹 Randomiser et limiter les recettes OK
        const shuffledOk = data.recipesOk
          .sort(() => 0.5 - Math.random())
          .slice(0, MAX_DISPLAY);

        // 🔹 Pour les recettes possibles, on groupe par missingCount, puis random dans chaque groupe
        const grouped = {};
        data.recipesPossible.forEach((r) => {
          const count = r.missingIngredients.length;
          if (!grouped[count]) grouped[count] = [];
          grouped[count].push(r);
        });

        const sortedPossible = Object.keys(grouped)
          .sort((a, b) => Number(a) - Number(b)) // +1, +2, ...
          .flatMap((key) =>
            grouped[key].sort(() => 0.5 - Math.random())
          )
          .slice(0, MAX_DISPLAY);

        setRecipesOk(shuffledOk);
        setRecipesPossible(sortedPossible);
      } catch (e) {
        console.error(e);
        setRecipesOk([]);
        setRecipesPossible([]);
      }
    };

    loadRecipes();
  }, [homeId, profileId]);

  const renderRow = (recipes, isPossible = false) => (
    <div className="flex gap-0 overflow-x-auto scroll-smooth relative px-5 gap-4">
      {recipes.map((item, index) => {
        const recipe = isPossible ? item.recipe : item;
        const missingCount = isPossible ? item.missingIngredients.length : 0;
        const bgClass = isPossible ? "bg-softBeige" : "bg-accentGreen text-white";

        return (
          <div
            key={recipe.id}
            className="w-[150px] flex-shrink-0 cursor-pointer transition-transform duration-300 py-4 relative"
            onClick={() => {
              setSelectedRecipe(recipe);
              setSelectedIngredients(
                isPossible ? item.missingIngredients : null
              );
              setShowAddToMenuModal(true);
            }}
          >

            <div className={`rounded-2xl overflow-hidden shadow-soft ${bgClass}`}>
              {/* HEADER: Nom de la recette tronqué */}
                <div className="w-full px-2 py-1 text-center text-sm font-semibold overflow-hidden whitespace-nowrap text-ellipsis">
                {recipe.name}
                </div>

              {/* IMAGE DE LA RECETTE */}
              <div className="w-full h-[125px] bg-gray-200 flex items-center justify-center overflow-hidden">
                {recipe.picture ? (
                  <img
                    src={`${CLOUDINARY_RES}${recipe.picture}`}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">Pas d'image</div>
                )}
              </div>

              {/* Badge ingrédients manquants */}
              {isPossible && missingCount > 0 && (
                <div className="absolute bottom-3 left-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-200 text-orange-800">
                    +{missingCount} {missingCount > 1 ? "ingrédients" : "ingrédient"} 
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 flex items-center mt-5">
        <img
          src={`${CLOUDINARY_RES}${CLOUDINARY_ICONS["Icon_Prep"]}`}
          alt="Recette Icon"
          className="w-6 h-6 inline-block mr-2"
        />
        Recettes possibles
      </h3>

      {recipesOk.length > 0 ? (
        <>
        <p className="mt-3 ml-5 text-xs font-semibold text-gray-700">
            Faisables à partir du <GardeMangerLink />
        </p>
        {renderRow(recipesOk)}
        </>
      ):(
        <>
          <p className="mt-3 ml-5 text-xs font-semibold text-gray-700">
              Aucune recettes faisables à partir du <GardeMangerLink />
          </p>
          <p className="ml-5 mb-5 mt-5 border-2 border-dashed border-gray-400 rounded text-center text-gray-500 h-[17vh] flex flex-col items-center justify-center gap-2">
            <div> Ajouter des produits dans <GardeMangerLink /> ou <ShoppingListLink /></div>
          </p>
        </>
      )}

      {recipesPossible.length > 0 && (
        <>
        <p className="mt-3 ml-5 text-xs font-semibold text-gray-700">
            Presque faisables (ingrédients manquants)
        </p>
        {renderRow(recipesPossible, true)}
        </>
      )}

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
          ingredients={selectedIngredients}
        />
      )}

    </div>
  );
}
