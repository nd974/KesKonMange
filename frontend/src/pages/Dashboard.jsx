// Dashboard.jsx - version corrigée avec gestion correcte de l'abonnement
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menus from "../components/Menus";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import RecipeDetail from "./RecipeDetails";

dayjs.locale("fr");

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Dashboard({ homeId, profileId}) {
  const [loading, setLoading] = useState(false); // TODO CHARGEMENT

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedMenusForDay, setSelectedMenusForDay] = useState([]);
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
  const [recipeIndex, setRecipeIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [menus, setMenus] = useState([]);
  const [todayMenus, setTodayMenus] = useState([]);
  const [subscriptionState, setSubscriptionState] = useState({});
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [subscribers, setSubscribers] = useState([]);

  const navigate = useNavigate();

  // Chargement des menus
  const loadMenus = async (homeId) => {
    if (!homeId) return;
    setLoading(true); // TODO deb du CHARGEMENT
    try {
      const res = await fetch(`${API_URL}/menu/get-byHome?homeId=${homeId}`);
      if (!res.ok) throw new Error("Erreur récupération menus");
      const data = await res.json();

      const expanded = data.map((m) => ({
        id: `${m.id}-${m.tag?.id || "none"}`,
        menuId: m.id,
        tagId: m.tag?.id || null,
        tagName: m.tag?.name || null,
        date: dayjs(m.date).format("YYYY-MM-DD"),
        recipes: m.recipes || [],
      }));

      setMenus(expanded);

      const today = dayjs().format("YYYY-MM-DD");
      setTodayMenus(expanded.filter((m) => m.date === today));
    } catch (e) {
      console.error("Erreur loadMenus Dashboard:", e);
      setMenus([]);
      setTodayMenus([]);
    }
     finally {
      setLoading(false);  // TODO fin du CHARGEMENT
      
    }
  };

  useEffect(() => {
    loadMenus(homeId);
  }, [homeId]);

  const checkSubscription = async (menuId, profileId) => {
    try {
      const res = await fetch(`${API_URL}/menu/checkSubscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuId, profileId }),
      });
      const data = await res.json();
      return data.isSubscribed;
    } catch (err) {
      console.error("Erreur lors de la vérification de l'abonnement:", err);
      return false;
    }
  };

  const updateSubscriptionState = async (menuId) => {
    // const profileId = localStorage.getItem("profile_id");
    console.log("menuObj", menuId);
    if (profileId && menuId) {
      const subscribed = await checkSubscription(menuId, profileId);
      setSubscriptionState(prev => ({
        ...prev,
        [menuId]: subscribed
      }));
    }
    console.log("subscriptionState", subscriptionState);
  };

  const handleSelectMenu = async (grouped) => {
    setSelectedDay(dayjs(grouped.date));
    setActiveMenuIndex(0);
    setRecipeIndex(0);

    const menusArr = (grouped.menus || []).map((m) => ({ ...m }));
    console.log("menusArr", menusArr);
    // Cas simple : tags déjà présents
    if (menusArr.some((m) => m.tagName)) {
      setSelectedMenusForDay(menusArr);
      setSelectedRecipe(menusArr?.[0]?.recipes?.[0] || null);

      for (const menu of menusArr) {
        await updateSubscriptionState(menu.id); // ← 🔧 FIX ici
      }

      return;
    }

    // Cas où il faut enrichir avec les tags
    try {
      const menuIds = Array.from(
        new Set(menusArr.map((m) => Number(m.menuId ?? m.id)).filter(Boolean))
      );

      if (menuIds.length === 0) {
        setSelectedMenusForDay(menusArr);
        setSelectedRecipe(menusArr?.[0]?.recipes?.[0] || null);
        // await updateSubscriptionState(menusArr[0]);
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
        tagMap[mid].push({ tag_id: row.tag_id, tag_name: row.tag_name });
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
      // await updateSubscriptionState(enriched[0]);
    } catch (err) {
      console.error("Erreur handleSelectMenu:", err);
      setSelectedMenusForDay(menusArr);
      setSelectedRecipe(menusArr?.[0]?.recipes?.[0] || null);
      // await updateSubscriptionState(menusArr[0]);
    }
  };

  const handlePick = (recipe, menu) => {
    setSelectedRecipe(recipe);
    if (menu) {
      setSelectedMenusForDay([menu]);
      setSelectedDay(dayjs(menu.date));
      const idx = menu.recipes.findIndex((r) => String(r.id) === String(recipe.id));
      setRecipeIndex(idx >= 0 ? idx : 0);
    }
  };
  

  // Navigation recettes
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

  useEffect(() => {
    const active = selectedMenusForDay[activeMenuIndex];
    if (!active) {
      setSelectedRecipe(null);
      return;
    }

    // ⚠️ On garde l’index actuel s’il est valide
    if (active.recipes?.[recipeIndex]) {
      setSelectedRecipe(active.recipes[recipeIndex]);
    } else {
      setRecipeIndex(0);
      setSelectedRecipe(active.recipes?.[0] || null);
    }
  }, [activeMenuIndex, selectedMenusForDay, recipeIndex]);


  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribeToMenu = async (menuId) => {
    if (subscribing) return; // 🔹 bloquer les clics multiples
    setSubscribing(true);

    // const profileId = localStorage.getItem("profile_id");
    const current = subscriptionState[menuId] === true;

    try {
      if (current) {
        // Désinscription
        const res = await fetch(`${API_URL}/menu/unsubscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ menuId, profileId }),
        });
        if (!res.ok) throw new Error("Erreur désinscription");
        setSubscriptionState(prev => ({ ...prev, [menuId]: false }));
      } else {
        // Abonnement
        const res = await fetch(`${API_URL}/menu/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ menuId, profileId }),
        });
        if (!res.ok) throw new Error("Erreur abonnement");
        setSubscriptionState(prev => ({ ...prev, [menuId]: true }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubscribing(false); // 🔹 réactivation du bouton
    }
  };


  const openSubscribersPopup = async () => {
    const menuId = selectedMenusForDay[activeMenuIndex].id;

    try {
      const res = await fetch(`${API_URL}/menu/getSubscribers?menuId=${menuId}`);
      const data = await res.json();
      setSubscribers(data); // ← aucun state, tu as demandé
    } catch (err) {
      console.error("Erreur load subscribers:", err);
    }

    setShowSubscribers(true);
  };


  const deleteMenuValidate = async () => {
    const menu = selectedMenusForDay[activeMenuIndex];
    if (!menu.id) return;
    if (confirm(`Voulez-vous vraiment supprimer le menu ${menu.date}-${menu.tagName}?`)) {
      try {
        const res = await fetch(`${API_URL}/menu/delete/${menu.id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.ok) {
          alert("Menu supprimée !");
          navigate("/todo");
        } else {
          alert("Erreur : " + data.error);
        }
      } catch (e) {
        console.error(e);
        alert("Erreur lors de la suppression");
      }
    }
  };

const [localCount, setLocalCount] = useState(1);

useEffect(() => {
  const recipe = selectedMenusForDay[activeMenuIndex]?.recipes[recipeIndex];
  if (recipe) {
    setLocalCount(recipe.count_recipe || 1);
  }
}, [activeMenuIndex, recipeIndex, selectedMenusForDay]);


  // const handleUpdateCountRecipe = async (menuId, recipeId, count_recipe) => {
  //   try {
  //     const res = await fetch(`${API_URL}/menu/update-count/${menuId}/${recipeId}`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ count_recipe }),
  //     });
  //     const data = await res.json();
  //     return true;
  //   } catch (err) {
  //     console.error("Erreur lors de la vérification de l'abonnement:", err);
  //     return false;
  //   }
  // };

  const handleCrementLocalCountRecipe = async(crement) => {
      const newCount = localCount + crement
      setLocalCount(Math.max(1, newCount));

      console.log("newCount",newCount);

      const menuId = selectedMenusForDay[activeMenuIndex]?.id;
      const recipeId = selectedMenusForDay[activeMenuIndex]?.recipes[recipeIndex]?.id;
      if (!menuId || !recipeId) return;

      // const success = await handleUpdateCountRecipe(menuId, recipeId, localCount);
      try {
        const res = await fetch(`${API_URL}/menu/update-count/${menuId}/${recipeId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count_recipe: newCount }),
        });
        const updatedMenus = [...selectedMenusForDay];
        updatedMenus[activeMenuIndex].recipes[recipeIndex].count_recipe = newCount;
        setSelectedMenusForDay(updatedMenus);
        // alert("Nombre de recettes mis à jour !");
      } catch (err) {
        alert("Erreur lors de la sauvegarde");
      }
  }


  return (
    
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8">
      {loading ? (  // TODO CHARGEMENT
        <p className="text-center text-gray-500 py-10">Chargement…</p>
      ) : (
        <section className="order-2 lg:order-1">
          <Header homeId={homeId} />

        {/* SECTION MENUS A (toujours visible) */}
        <main className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT – détail */}
          <section className="order-2 lg:order-1">
            <div className="flex items-center gap-3 mb-4">
            {selectedDay && (
              <>
                <div className="bg-softBeige px-3 py-1 rounded-full text-sm font-semibold">
                  {selectedDay.format("D MMMM YYYY")}
                </div>

                {/* tags desktop */}
                <div className="ml-auto hidden sm:flex gap-2">
                  {selectedMenusForDay?.map((m, i) => (
                    <button
                      key={m.id || `${m.menuId}-${m.tagId}-${i}`}
                      onClick={() => setActiveMenuIndex(i)}
                      className={`px-3 py-1 rounded-xl text-sm font-medium ${
                        i === activeMenuIndex ? "bg-accentGreen text-white shadow-soft" : "bg-white/70"
                      }`}
                    >
                      {m.tagName}
                    </button>
                  ))}
                </div>

                {/* mobile */}
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
                <div className="flex flex-col items-center relative">
                                                          {/* TRASH À DROITE */}
                      <button
                        onClick={deleteMenuValidate}
                        className="absolute right-0 text-right z-50"
                      >
                        ❌
                      </button>


                  <div className="w-full flex items-center pt-8 relative mb-4">
                    {/* GROUPE CENTRÉ */}
                    <div className="flex items-center gap-2 mx-auto">


                      <button
                        className="text-2xl"
                        onClick={() => handleSubscribeToMenu(selectedMenusForDay[activeMenuIndex].id)}
                        disabled={subscribing} // 🔹 bloque pendant la requête
                      >
                        {subscriptionState[selectedMenusForDay[activeMenuIndex].id] ? (
                          <span style={{ color: "green" }}>◉</span>
                        ) : (
                          <span style={{ color: "red" }}>⭘</span>
                        )}
                      </button>


                      <h2 className="text-2xl font-semibold text-center">
                        {selectedMenusForDay[activeMenuIndex]?.tagName}
                      </h2>

                      <button onClick={openSubscribersPopup} className="text-2xl">
                        📋
                      </button>

                    </div>
                  </div>

<div className="py-2 relative">
  {/* Navigation entre les recettes (précédent / suivant) */}
  <div className="flex items-center justify-center gap-4">
    {selectedMenusForDay?.[activeMenuIndex]?.recipes?.length > 1 && (
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
    )}

    {/* Nom de la recette dans des chevrons */}
    <h1 className="text-3xl font-bold text-center">
      {selectedMenusForDay[activeMenuIndex]?.recipes[recipeIndex]?.name}
    </h1>

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
      </button>
    )}
  </div>

  {/* Ligne avec les boutons de décrémentation et d'incrémentation */}
  <div className="flex items-center justify-center gap-4 py-2">
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
  </div>
</div>





                  <div className="flex-1 mx-0 lg:mx-8 w-full">
                    <RecipeDetail
                      key={selectedRecipe?.id}
                      homeId={homeId}
                      profileId={profileId}
                      id={selectedRecipe?.id}
                    />
                  </div>

                  {/* mobile */}
                  {/* {selectedMenusForDay?.[activeMenuIndex]?.recipes?.length > 1 && (
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
                        disabled={
                          recipeIndex >=
                          selectedMenusForDay[activeMenuIndex].recipes.length - 1
                        }
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
                  )} */}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-10">
                  Choisir un jour avec menu(s) enregistré(s).
                </p>
              )}

              {selectedMenusForDay?.[activeMenuIndex]?.recipes?.length > 1 && (
                <div className="text-sm text-gray-600 text-center mt-4">
                  {recipeIndex + 1} / {selectedMenusForDay[activeMenuIndex].recipes.length}
                </div>
              )}
            </div>
          </section>

          {/* RIGHT — regroupement de Menu A + Menu B */}
          <div className="order-1 lg:order-2 flex flex-col gap-6">

            {/* MENU A (toujours visible) */}
            <section>
              <Menus
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                onPick={handlePick}
                onSelectMenu={handleSelectMenu}
                homeId={homeId}
              />
              <div className="h-6" />
            </section>

            {/* MENU B (visible seulement desktop) */}
            <section className="hidden lg:block">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Recettes Possibles
              </h3>
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
        </section>
      )}
    </div>
  );
}
