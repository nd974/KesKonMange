import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import TagTree from "../components/TagTree.jsx";
import RecipeCard from "../components/RecipeCard.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Recipes({ homeId, profileId }) {
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [tagsFlat, setTagsFlat] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileTags, setShowMobileTags] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const RECIPES_PER_PAGE = 12;

  // ⚡ Charger les recettes et tags
  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const [recipesRes, tagsRes] = await Promise.all([
          fetch(`${API_URL}/recipe/get-all`, {
            method: "POST", // ⚡ POST pour envoyer profileId
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileId }),
          }).then((r) => r.json()),

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

  // Réinitialiser la page quand recherche ou filtre change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTagIds]);

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

  // Trier les recettes aléatoirement
  const sortedRecipes = useMemo(() => {
    return [...filteredRecipes].sort(() => Math.random() - 0.5);
  }, [filteredRecipes]);

  // Pagination
  const paginatedRecipes = useMemo(() => {
    const start = (currentPage - 1) * RECIPES_PER_PAGE;
    const end = start + RECIPES_PER_PAGE;
    return sortedRecipes.slice(start, end);
  }, [sortedRecipes, currentPage]);

  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);

  console.log("RECIPES +====================", recipes);

  return (
    <div className="">
      {/* <Header homeId={homeId}/> */}

      <div className="content py-8">
        <div className="recipes-header">
          <div className="controls flex flex-wrap md:flex-nowrap items-center gap-2">
            <input
              className="search-bar flex-1 min-w-[150px] p-2 border rounded"
              type="text"
              placeholder="Rechercher une recette..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button
              className="md:hidden px-3 py-2 bg-gray-100 rounded-lg shadow text-sm w-auto"
              onClick={() => setShowMobileTags(true)}
            >
              🔍 Filtrer
            </button>

            {selectedTagIds.length > 0 && (
              <button
                className="hidden md:inline-block clear-filter px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-auto"
                onClick={() => setSelectedTagIds([])}
                title="Effacer filtre"
              >
                Effacer filtre
              </button>
            )}

            <button
              className="px-4 py-2 rounded hover:bg-softPink flex items-center gap-2 hidden md:inline bg-accentGreen text-white font-bold"
              onClick={() => navigate("/recipe/add")}
              title="Ajouter recette"
            >
              Ajouter Recette
            </button>
          </div>

          {selectedTagIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTagIds.map((id) => {
                const tag = tagsFlat.find((t) => t.id === id);
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                  >
                    {tag?.name || "Tag"}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTagIds((prev) => prev.filter((t) => t !== id))
                      }
                      className="text-red-500 hover:text-red-700 text-xs font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="main-grid flex gap-4 py-4">
          <aside className="hidden md:block sidebar bg-softBeige p-4 rounded">
            <h3 className="font-semibold mb-2">Tags</h3>
            <TagTree
              tagsFlat={tagsFlat}
              tagTree={tagTree}
              selectedTagIds={selectedTagIds}
              setSelectedTagIds={setSelectedTagIds}
              isOpen={false}
            />
          </aside>

          <section className="recipes-section flex-1">
            {loading ? (
              <div className="muted">Chargement...</div>
            ) : filteredRecipes.length === 0 ? (
              <div className="muted">Aucune recette trouvée.</div>
            ) : (
              <>
                <div className="
                  grid 
                  grid-cols-1 
                  sm:grid-cols-2 
                  md:grid-cols-3 
                  lg:grid-cols-4 
                  xl:grid-cols-6 
                  gap-4
                ">
                  {paginatedRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} homeId={homeId} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <button
                      className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    >
                      ← Précédent
                    </button>

                    <span className="px-3 py-1">
                      Page {currentPage} / {totalPages}
                    </span>

                    <button
                      className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                    >
                      Suivant →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

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
              isOpen={false}
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
