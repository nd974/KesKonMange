import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/fr";

import Menus from "../components/Menus";
import NewRecipeDetail from "./TMP/NewRecipeDetail";
import RecipePossible from "../components/RecipePossible";

import {
  useSubscription,
  useSubscribers,
  useToggleSubscription,
  useDeleteMenu,
  useUpdateRecipeCount,
} from "../hooks/useMenu";



dayjs.locale("fr");

import { CLOUDINARY_RES, CLOUDINARY_ICONS } from "../config/constants";

export default function Dashboard({ homeId, profileId }) {
  const navigate = useNavigate();

  const location = useLocation();
  const targetDate = location.state?.targetDate || null;
  const targetTagId = location.state?.targetTagId || null;

  /* ---------------- State UI ---------------- */
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedMenusForDay, setSelectedMenusForDay] = useState([]);
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
  const [recipeIndex, setRecipeIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);

  const [showSubscribers, setShowSubscribers] = useState(false);
  const [localCount, setLocalCount] = useState(1);

  /* ---------------- Menu actif ---------------- */
  const activeMenu = selectedMenusForDay[activeMenuIndex];
  const activeMenuId = activeMenu?.id;
  const activeRecipe = activeMenu?.recipes?.[recipeIndex];

  /* ---------------- React Query ---------------- */
  const { data: isSubscribed = false } = useSubscription(
    activeMenuId,
    profileId
  );

  const { data: subscribers = [] } = useSubscribers(
    activeMenuId,
    showSubscribers
  );

  const toggleSubscription = useToggleSubscription();
  const deleteMenuMutation = useDeleteMenu();
  const updateRecipeCountMutation = useUpdateRecipeCount();

  /* ---------------- Sélection menu ---------------- */
  const handleSelectMenu = (grouped) => {
    const menus = grouped.menus || [];

    // 🔹 STOP si le menu est déjà sélectionné pour éviter boucle
    const menusIds = menus.map(m => m.id).join(",");
    const currentMenusIds = selectedMenusForDay.map(m => m.id).join(",");
    if (menusIds === currentMenusIds) return; // ⚠️ vérifie côté Dashboard

    setSelectedDay(dayjs(grouped.date));
    setActiveMenuIndex(0);
    setRecipeIndex(0);
    setSelectedMenusForDay(menus);
    setSelectedRecipe(menus?.[0]?.recipes?.[0] || null);
  };



  /* ---------------- Navigation recettes ---------------- */
  const showPrev = () => {
    if (!activeMenu?.recipes || recipeIndex <= 0) return;
    setRecipeIndex((i) => i - 1);
  };

  const showNext = () => {
    if (
      !activeMenu?.recipes ||
      recipeIndex >= activeMenu.recipes.length - 1
    )
      return;
    setRecipeIndex((i) => i + 1);
  };

  useEffect(() => {
    if (!activeMenu) {
      setSelectedRecipe(null);
      return;
    }

    if (activeMenu.recipes?.[recipeIndex]) {
      setSelectedRecipe(activeMenu.recipes[recipeIndex]);
    } else {
      setRecipeIndex(0);
      setSelectedRecipe(activeMenu.recipes?.[0] || null);
    }
  }, [activeMenu, recipeIndex]);


  /* ---------------- Compteur recettes ---------------- */
  useEffect(() => {
    if (activeRecipe) {
      setLocalCount(activeRecipe.count_recipe || 1);
    }
  }, [activeRecipe]);

  const handleCrementLocalCountRecipe = (crement) => {
    if (!activeMenuId || !activeRecipe) return;

    const newCount = Math.max(1, localCount + crement);
    setLocalCount(newCount);

    updateRecipeCountMutation.mutate({
      menuId: activeMenuId,
      recipeId: activeRecipe.id,
      count: newCount,
    });
  };

  /* ---------------- Abonnement ---------------- */
  const handleToggleSubscription = () => {
    if (!activeMenuId || !profileId) return;

    toggleSubscription.mutate({
      menuId: activeMenuId,
      profileId,
      subscribed: isSubscribed,
    });
  };

  /* ---------------- Suppression menu ---------------- */
  const deleteMenuValidate = () => {
    if (!activeMenuId) return;

    if (confirm(`Supprimer le menu ${activeMenu.tagName} ?`)) {
      deleteMenuMutation.mutate(activeMenuId, {
        onSuccess: () => navigate("/todo"),
        onError: (e) => alert(e.message),
      });
    }
  };

  const recipes = selectedMenusForDay?.[activeMenuIndex]?.recipes ?? [];


  console.log(targetDate, targetTagId);
  // Selection du target
  useEffect(() => {
    if (
      !targetTagId ||
      !selectedMenusForDay.length
    ) return;

    const index = selectedMenusForDay.findIndex(
      (m) => m.tagId === targetTagId
    );

    if (index !== -1) {
      setActiveMenuIndex(index);
      setRecipeIndex(0);
      setSelectedRecipe(
        selectedMenusForDay[index]?.recipes?.[0] || null
      );
    }
  }, [selectedMenusForDay, targetTagId]);
  useEffect(() => {
    if (!targetDate) return;

    setSelectedDay(dayjs(targetDate));
  }, [targetDate]);

  useEffect(() => {
    if (!targetDate && !targetTagId) return;

    // Supprime le state de l’historique sans changer l’URL
    window.history.replaceState({}, document.title);
  }, []);


  return (
    

    <section className="order-2 lg:order-1">
          {/* <Header homeId={homeId} /> */}

        {/* SECTION MENUS A (toujours visible) */}
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT – détail */}
          <section className={`order-2 lg:order-1 ${selectedRecipe ? "" : "hidden sm:block"}`}>
            <div className="flex items-center gap-3">
              {selectedDay && (
                <>
                  {/* tags desktop */}
                  <div   className={`hidden sm:flex ml-5 ${selectedMenusForDay?.length === 1 ? "mb-5" : ""}`}>
                    {selectedMenusForDay.length > 1 && selectedMenusForDay?.map((m, i) => (
                      <button
                        key={m.id || `${m.menuId}-${m.tagId}-${i}`}
                        onClick={() => setActiveMenuIndex(i)}
                        className={`px-3 py-1 sm:px-5 rounded-tl-2xl rounded-tr-lg -mt-2
                          text-sm sm:text-base font-medium -mb-1 transition-all ${
                            i === activeMenuIndex
                              ? "bg-accentGreen text-white shadow-soft"
                              : "bg-gray-200 hover:bg-gray-300"
                          }`}
                      >
                        {m.tagName}
                      </button>
                    ))}
                  </div>

                  {/* date desktop */}
                  <div className="hidden ml-auto bg-softBeige px-3 py-1 rounded-full text-sm font-semibold">
                    {selectedDay.format("D MMMM YYYY")}
                  </div>

                  {/* mobile */}
                  <div className="flex sm:hidden w-full items-center justify-between px-4">
                    {/* liste déroulante à gauche */}
                    <select
                      onChange={(e) => setActiveMenuIndex(Number(e.target.value))}
                      className="bg-accentGreen text-white px-3 py-1 rounded-full text-sm font-semibold"
                      value={activeMenuIndex}
                    >
                      {selectedMenusForDay?.map((m, i) => (
                        <option
                          key={m.id || `${m.menuId}-${m.tagId}-${i}`}
                          value={i}
                        >
                          {m.tagName}
                        </option>
                      ))}
                    </select>

                    {/* date à droite */}
                    <div className="bg-softBeige px-3 py-1 rounded-full text-sm font-semibold">
                      {selectedDay.format("D MMMM YYYY")}
                    </div>
                  </div>
                </>
              )}
            </div>


            <div className={`bg-gray-100 soft-card rounded-3xl shadow-soft relative ${selectedRecipe ? "" : "-mt-5 md:mt-0 ml-5 md:ml-0"}`}> 
              {selectedRecipe ? (
                <div className="flex flex-col items-center relative">
                                                          {/* TRASH À DROITE */}
                      <button
                        onClick={deleteMenuValidate}
                        className="absolute right-1.5 top-1.5 text-right z-10"
                      >
                        ❌
                      </button>


                  <div className="w-full flex items-center relative mt-2">
                    <div className="relative flex items-center w-full px-4">
                      {/* Date à gauche */}
                      <div className="absolute left-5 text-xs font-bold bg-softBeige px-5 py-1 rounded-full hidden sm:flex">
                        {selectedDay.format("D MMMM YYYY")}
                      </div>

                      {/* Centre : boutons + titre */}
                      <div className="flex items-center gap-4 mx-auto">
                        <button
                          className="text-2xl"
                          onClick={handleToggleSubscription}
                          disabled={toggleSubscription.isLoading}
                        >
                          {isSubscribed ? (
                            <span style={{ color: "green" }}>◉</span>
                          ) : (
                            <span style={{ color: "red" }}>⭘</span>
                          )}
                        </button>

                        <h2 className="text-2xl font-semibold text-center">
                          [{selectedMenusForDay[activeMenuIndex]?.tagName}]
                        </h2>

                        <button
                          onClick={() => setShowSubscribers(true)}
                          className="text-2xl"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>

<div className="py-2 relative">
  {/* Navigation entre les recettes (précédent / suivant) */}
  <div className="flex items-center justify-center gap-4">
    {/* Nom de la recette dans des chevrons */}
    <h1
      className="text-center text-2xl sm:text-4xl font-bold text-softPink"
      style={{
        WebkitTextStroke: "4px white",
        paintOrder: "stroke fill",
        whiteSpace: "normal",        // autorise les retours à la ligne
        wordWrap: "break-word",      // coupe les mots trop longs
        overflowWrap: "break-word",  // compatibilité tous navigateurs
        textAlign: "center",
        margin: "0 auto",
      }}
    >
      {selectedMenusForDay[activeMenuIndex]?.recipes[recipeIndex]?.name}
    </h1>

  </div>

  {/* Ligne avec les boutons de décrémentation et d'incrémentation */}
  <div className="flex items-center justify-center gap-4 py-2">
    {selectedMenusForDay?.[activeMenuIndex]?.recipes?.length > 1 && (
      <button
        onClick={showPrev}
        disabled={recipeIndex <= 0}
        className={`px-3 py-1 rounded-md ${
          recipeIndex > 0
            ? "cursor-pointer"
            : "bg-white/60 opacity-50 cursor-not-allowed"
        }`}
      >
        ◀
      </button>
    )}
    {/* Décrément à gauche */}
    <button
      onClick={() => handleCrementLocalCountRecipe(-1)}
      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
    >
      -
    </button>

    {/* Affichage de la quantité */}
    <span className="text-xl">{localCount}</span>

    {/* Incrément à droite */}
    <button
      onClick={() => handleCrementLocalCountRecipe(1)}
      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
    >
      +
    </button>
    {selectedMenusForDay?.[activeMenuIndex]?.recipes?.length > 1 && (
      <button
        onClick={showNext}
        disabled={recipeIndex >= selectedMenusForDay[activeMenuIndex].recipes.length - 1}
        className={`px-3 py-1 rounded-md ${
          recipeIndex < selectedMenusForDay[activeMenuIndex].recipes.length - 1
            ? "cursor-pointer"
            : "bg-white/60 opacity-50 cursor-not-allowed"
        }`}
      >
        ▶
      {/* <img
        src={`${CLOUDINARY_RES}${CLOUDINARY_ICONS["Icon_Menu"]}`}
        alt="Menu Icon"
        className="w-5 h-5 inline-block"
      /> */}
      </button>
    )}
  </div>
</div>





            <div className="flex justify-center w-full">
              <div className="w-full max-w-[800px]">
                <NewRecipeDetail
                  key={selectedRecipe?.id}
                  homeId={homeId}
                  profileId={profileId}
                  id={selectedRecipe?.id}
                  compact={true}
                />
              </div>
            </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-10 mt-5">
                  Choisir un jour avec menu(s) enregistré(s).
                </p>
              )}
{/* 
              {selectedMenusForDay?.[activeMenuIndex]?.recipes?.length > 1 && (
                <div className="text-sm text-gray-600 text-center mt-4">
                  {recipeIndex + 1} / {selectedMenusForDay[activeMenuIndex].recipes.length}
                </div>
              )} */}
            </div>
          </section>

          {/* RIGHT — regroupement de Menu A + Menu B */}
          <div className="order-1 lg:order-2 flex flex-col">

            {/* MENU A (toujours visible) */}
            <section>
              <Menus
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                // onPick={handlePick}
                onSelectMenu={handleSelectMenu}
                homeId={homeId}
              />
              {/* <div className="h-2" /> */}
            </section>

            {/* MENU B (visible seulement desktop) */}
            <section className="hidden lg:block">
              <RecipePossible 
                homeId={homeId} 
                profileId={profileId}
              />
            </section>

          </div>
        </main>


      {showSubscribers && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80">
            <h3 className="text-xl font-bold mb-4 text-center">Inscrits</h3>

            {(subscribers || []).length === 0 ? (
              <p className="text-center text-gray-500">Aucun profil inscrit</p>
            ) : (
              <ul className="space-y-2">
                {subscribers.map((p) => (
                  <li key={p.id} className="p-2 bg-gray-100 rounded">
                    {p.name || p.email || `Profil ${p.id}`}
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={() => setShowSubscribers(false)}
              className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
            <section className="mt-5 lg:hidden">
              <RecipePossible homeId={homeId} profileId={profileId}/>
            </section>
        </section>
      )
}
