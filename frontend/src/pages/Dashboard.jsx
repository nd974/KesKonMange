import React, { useEffect, useState } from "react";
import { Route, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menus from "../components/Menus";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { CLOUDINARY_RECETTE_NOTFOUND, CLOUDINARY_RES } from "../config/constants";
import RecipeDetail from "./RecipeDetails";

dayjs.locale("fr");

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Dashboard({homeId}) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedMenusForDay, setSelectedMenusForDay] = useState([]);
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
  const [recipeIndex, setRecipeIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [menus, setMenus] = useState([]);
  const [todayMenus, setTodayMenus] = useState([]);
  const navigate = useNavigate();
  // const [homeId, setHomeId] = useState(Number(localStorage.getItem("home_id")));

  // 🔁 Charger les menus depuis le backend PostgreSQL
  const loadMenus = async (homeId) => {
    if (!homeId) return;
    try {
      const res = await fetch(`${API_URL}/menu/get-byHome?homeId=${homeId}`);
      if (!res.ok) throw new Error("Erreur récupération menus");
      const data = await res.json();

      // même logique que Calendar.jsx
      const expanded = data.map((m) => ({
        id: `${m.id}-${m.tag?.id || "none"}`,
        menuId: m.id,
        tagId: m.tag?.id || null,
        tagName: m.tag?.name || null,
        date: dayjs(m.date).format("YYYY-MM-DD"),
        recipes: m.recipes || [],
      }));

      setMenus(expanded);

      // filtrer les menus du jour
      const today = dayjs().format("YYYY-MM-DD");
      setTodayMenus(expanded.filter((m) => m.date === today));
    } catch (e) {
      console.error("Erreur loadMenus Dashboard:", e);
      setMenus([]);
      setTodayMenus([]);
    }
  };

  useEffect(() => {
    loadMenus(homeId);
  }, [homeId]);

  // 🥗 Sélection d’un menu depuis Menus.jsx
  const handleSelectMenu = async (grouped) => {
    setSelectedDay(dayjs(grouped.date));
    setActiveMenuIndex(0);
    setRecipeIndex(0);

    const menusArr = (grouped.menus || []).map((m) => ({ ...m }));
    if (menusArr.some((m) => m.tagName)) {
      setSelectedMenusForDay(menusArr);
      setSelectedRecipe(menusArr?.[0]?.recipes?.[0] || null);
      return;
    }

    // récupérer les tags manquants via API
    try {
      const menuIds = Array.from(
        new Set(menusArr.map((m) => Number(m.menuId ?? m.id)).filter(Boolean))
      );
      if (menuIds.length === 0) {
        setSelectedMenusForDay(menusArr);
        setSelectedRecipe(menusArr?.[0]?.recipes?.[0] || null);
        return;
      }

      const res = await fetch(`${API_URL}/menu/get-tags-for-menus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuIds }),
      });
      if (!res.ok) throw new Error("Erreur récupération tags");
      const tagsData = await res.json();

      const tagMap = {};
      for (const row of tagsData) {
        const mid = String(row.menu_id);
        tagMap[mid] = tagMap[mid] || [];
        tagMap[mid].push({
          tag_id: row.tag_id,
          tag_name: row.tag_name,
        });
      }

      const enriched = menusArr.map((m) => {
        const mid = String(Number(m.menuId ?? m.id));
        const tagsFor = tagMap[mid] || [];
        return {
          ...m,
          tagId: m.tagId ?? (tagsFor[0]?.tag_id ?? null),
          tagName: m.tagName ?? (tagsFor[0]?.tag_name ?? null),
          tagNames: tagsFor.map((t) => t.tag_name),
        };
      });

      setSelectedMenusForDay(enriched);
      setSelectedRecipe(enriched?.[0]?.recipes?.[0] || null);
    } catch (err) {
      console.error("Erreur handleSelectMenu:", err);
      setSelectedMenusForDay(menusArr);
      setSelectedRecipe(menusArr?.[0]?.recipes?.[0] || null);
    }
  };

  // Sélection directe d’une recette
  const handlePick = (recipe, menu) => {
    setSelectedRecipe(recipe);
    if (menu) {
      setSelectedMenusForDay([menu]);
      setSelectedDay(dayjs(menu.date));
      const idx = menu.recipes.findIndex((r) => String(r.id) === String(recipe.id));
      setRecipeIndex(idx >= 0 ? idx : 0);
    }
  };

  // Navigation dans les recettes
  const showPrev = () => {
    const active = selectedMenusForDay[activeMenuIndex];
    if (!active?.recipes?.length || recipeIndex <= 0) return;
    const next = recipeIndex - 1;
    setRecipeIndex(next);
    setSelectedRecipe(active.recipes[next]);
  };

  const showNext = () => {
    const active = selectedMenusForDay[activeMenuIndex];
    if (!active?.recipes?.length || recipeIndex >= active.recipes.length - 1) return;
    const next = recipeIndex + 1;
    setRecipeIndex(next);
    setSelectedRecipe(active.recipes[next]);
  };

  // Quand on change de tag (menu du jour)
  useEffect(() => {
    const active = selectedMenusForDay[activeMenuIndex];
    if (active) {
      setRecipeIndex(0);
      setSelectedRecipe(active.recipes?.[0] || null);
    } else {
      setSelectedRecipe(null);
    }
  }, [activeMenuIndex, selectedMenusForDay]);

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8">
      <Header homeId={homeId}/>
      <main className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: détail de la recette sélectionnée */}
        <section className="order-2 lg:order-1">
        <div className="flex items-center gap-3 mb-4">
            {selectedDay && (
                <>
                <div className="bg-softBeige px-3 py-1 rounded-full text-sm font-semibold">
                    {selectedDay.format("D MMMM YYYY")}
                </div>

                {/* Dropdown menu for mobile */}
                <div className="ml-auto hidden sm:block flex gap-2">
                    {selectedMenusForDay?.map((m, i) => (
                      <button
                          key={m.id || `${m.menuId}-${m.tagId}-${i}`}
                          onClick={() => setActiveMenuIndex(i)}
                          className={`px-3 py-1 rounded-xl text-sm font-medium ${
                          i === activeMenuIndex
                              ? "bg-accentGreen text-white shadow-soft"
                              : "bg-white/70"
                          }`}
                      >
                          {m.tagName}
                      </button>
                    ))}
                </div>

                {/* Mobile dropdown (visible on small screens) */}
                <div className="ml-auto sm:hidden">
                    <select
                      onChange={(e) => setActiveMenuIndex(Number(e.target.value))}
                      className="bg-accentGreen text-white px-3 py-1 rounded-full text-sm font-semibold"
                      value={activeMenuIndex}
                      >
                      {selectedMenusForDay?.map((m, i) => (
                          <option key={m.id || `${m.menuId}-${m.tagId}-${i}`} value={i}>
                          {m.tagName}
                          </option>
                      ))}
                    </select>
                </div>
                </>
            )}
        </div>

        <div className="soft-card rounded-lg shadow-soft relative">
          {selectedRecipe ? (
            <div className="flex flex-col lg:flex-row items-center relative">
              
              {/* Desktop: flèches à gauche et droite */}
              {selectedMenusForDay?.[activeMenuIndex]?.recipes?.length > 1 && (
                <button
                  onClick={showPrev}
                  disabled={recipeIndex <= 0}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md hidden lg:block ${
                    recipeIndex > 0
                      ? "hover:shadow cursor-pointer"
                      : "bg-white/60 opacity-50 cursor-not-allowed"
                  }`}
                >
                  ◀
                </button>
              )}

              <div className="flex-1 mx-0 lg:mx-8">
                <RecipeDetail homeId={homeId} id={selectedRecipe.id} />
              </div>

              {selectedMenusForDay?.[activeMenuIndex]?.recipes?.length > 1 && (
                <button
                  onClick={showNext}
                  disabled={recipeIndex >= selectedMenusForDay[activeMenuIndex].recipes.length - 1}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md hidden lg:block ${
                    recipeIndex <
                    selectedMenusForDay[activeMenuIndex].recipes.length - 1
                      ? "cursor-pointer"
                      : "bg-white/60 opacity-50 cursor-not-allowed"
                  }`}
                >
                  ▶
                </button>
              )}
              {/* Mobile: flèches en haut */}
              {selectedMenusForDay?.[activeMenuIndex]?.recipes?.length > 1 && (
                <div className="flex justify-center gap-4 mb-4 lg:hidden">
                  <button
                    onClick={showPrev}
                    disabled={recipeIndex <= 0}
                    className={`px-3 py-1 rounded-md ${
                      recipeIndex > 0
                        ? "hover:shadow cursor-pointer"
                        : "bg-white/60 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    ◀
                  </button>
                  <button
                    onClick={showNext}
                    disabled={recipeIndex >= selectedMenusForDay[activeMenuIndex].recipes.length - 1}
                    className={`px-3 py-1 rounded-md ${
                      recipeIndex <
                      selectedMenusForDay[activeMenuIndex].recipes.length - 1
                        ? "cursor-pointer"
                        : "bg-white/60 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    ▶
                  </button>
                </div>
              )}
            </div>
            
          ) : (
            <p className="text-gray-500 text-center py-10">
              Choisir un jour avec menu(s) enregistré(s).
            </p>
          )}

          {/* Pagination textuelle */}
          {selectedMenusForDay?.[activeMenuIndex]?.recipes?.length > 1 && (
            <div className="text-sm text-gray-600 text-center mt-4">
              {recipeIndex + 1} / {selectedMenusForDay[activeMenuIndex].recipes.length}
            </div>
          )}
        </div>




        </section>

        {/* Right: menus à venir */}
        <section className="order-1 lg:order-2">
          <Menus
            selectedDay={selectedDay}
            setSelectedDay={(d) => setSelectedDay(d)}
            onPick={(r) => handlePick(r)}
            onSelectMenu={handleSelectMenu}
            homeId={homeId}
          />
          <div className="h-6" />
        </section>
      </main>
    </div>
  );
}
