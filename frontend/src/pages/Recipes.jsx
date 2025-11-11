import { useEffect, useState, useMemo } from "react";
import Header from "../components/Header.jsx";
import TagTree from "../components/TagTree.jsx";
import RecipeCard from "../components/RecipeCard.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Recipes({homeId}) {
  const [recipes, setRecipes] = useState([]);
  const [tagsFlat, setTagsFlat] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileTags, setShowMobileTags] = useState(false);

  // Modal add to menu
  const [showAddToMenuModal, setShowAddToMenuModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [menus, setMenus] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [menuDate, setMenuDate] = useState("");
  const [selectedMealTagId, setSelectedMealTagId] = useState([]);

  // ⚡ Charger les recettes et tags
  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const [recipesRes, tagsRes] = await Promise.all([
          fetch(`${API_URL}/recipe/get-all`).then((r) => r.json()),
          fetch(`${API_URL}/tag/get-all`).then((r) => r.json()),
        ]);
        if (!mounted) return;
        setRecipes(recipesRes || []);
        setTagsFlat(tagsRes || []);
      } catch (err) {
        console.error("Erreur chargement données:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, []);

  const parentMap = useMemo(() => {
    const map = new Map();
    tagsFlat.forEach((t) => {
      if (!map.has(t.parent_id)) map.set(t.parent_id, []);
      map.get(t.parent_id).push(t.id);
    });
    return map;
  }, [tagsFlat]);

  function collectDescendantIds(tagId) {
    const result = new Set();
    const stack = [tagId];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!result.has(current)) {
        result.add(current);
        const children = parentMap.get(current) || [];
        stack.push(...children);
      }
    }
    return Array.from(result);
  }

  const tagTree = useMemo(() => {
    const map = new Map();
    tagsFlat.forEach((t) => map.set(t.id, { ...t, children: [] }));
    const roots = [];
    for (const t of map.values()) {
      if (t.parent_id == null) roots.push(t);
      else {
        const parent = map.get(t.parent_id);
        if (parent) parent.children.push(t);
        else roots.push(t);
      }
    }
    return roots;
  }, [tagsFlat]);

  const filteredRecipes = useMemo(() => {
    const s = search.trim().toLowerCase();
    const selectedDescendants =
      selectedTagIds.length > 0
        ? selectedTagIds.flatMap((id) => collectDescendantIds(id))
        : [];

    return recipes.filter((r) => {
      const matchSearch = !s || r.name.toLowerCase().includes(s);
      const matchTag =
        selectedDescendants.length === 0 ||
        (r.tags || []).some((t) => t.id && selectedDescendants.includes(t.id));
      return matchSearch && matchTag;
    });
  }, [recipes, search, selectedTagIds, tagsFlat]);

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
      console.log(payload);
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

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8">
      <Header />

      <div className="content py-8">
        <div className="recipes-header">
          <div className="controls flex gap-2 flex-wrap">
            <input
              className="search-bar flex-1 p-2 border rounded"
              type="text"
              placeholder="Rechercher une recette..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="md:hidden px-3 py-2 bg-gray-100 rounded-lg shadow text-sm"
              onClick={() => setShowMobileTags(true)}
            >
              🔍 Filtrer
            </button>
            {selectedTagIds.length > 0 && (
              <button
                className="hidden md:inline-block clear-filter px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => setSelectedTagIds([])}
                title="Effacer filtre"
              >
                Effacer filtre
              </button>
            )}
          </div>

          {selectedTagIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTagIds.map((id) => {
                const tag = tagsFlat.find((t) => t.id === id);
                return (
                  <span key={id} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                    {tag?.name || "Tag"}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="main-grid flex gap-4 py-4">
          <aside className="hidden md:block sidebar bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Tags</h3>
            <TagTree
              tagsFlat={tagsFlat}
              tagTree={tagTree}
              selectedTagIds={selectedTagIds}
              setSelectedTagIds={setSelectedTagIds}
            />
          </aside>

          <section className="recipes-section flex-1">
            {loading ? (
              <div className="muted">Chargement...</div>
            ) : filteredRecipes.length === 0 ? (
              <div className="muted">Aucune recette trouvée.</div>
            ) : (
              <div className="recipes-grid grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onAddToMenu={(r) => {
                      setSelectedRecipe(r);
                      setShowAddToMenuModal(true);
                      fetchMenus();
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
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
                    <option key={m.id} value={m.id}>{m.name} - {m.date}</option>
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
                  {(tagsFlat
                    .filter(t => t.parent_id === tagsFlat.find(tag => tag.name === "Repas")?.id)
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

      {/* Mobile Tags */}
      {showMobileTags && (
        <div className="fixed inset-0 bg-black/50 z-50 flex">
          <div className="bg-white w-3/4 max-w-sm h-full p-4 overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filtres</h3>
              <button
                onClick={() => setShowMobileTags(false)}
                className="text-gray-500 text-xl"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <TagTree
              tagsFlat={tagsFlat}
              tagTree={tagTree}
              selectedTagIds={selectedTagIds}
              setSelectedTagIds={setSelectedTagIds}
            />
            {selectedTagIds.length > 0 && (
              <button
                className="mt-4 w-full bg-gray-200 rounded-lg py-2 text-sm"
                onClick={() => {
                  setSelectedTagIds([]);
                  setShowMobileTags(false);
                }}
              >
                Effacer filtre
              </button>
            )}
          </div>

          <div className="flex-1" onClick={() => setShowMobileTags(false)} aria-label="Fermer" />
        </div>
      )}
    </div>
  );
}
