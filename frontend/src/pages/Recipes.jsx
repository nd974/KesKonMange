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

  // ⚡ Charger les recettes et tags depuis l’API
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

        // recipesRes attendu : [{id, name, picture, tags: [{id,name}]}]
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

  // Map parent_id → enfants
  const parentMap = useMemo(() => {
    const map = new Map();
    tagsFlat.forEach((t) => {
      if (!map.has(t.parent_id)) map.set(t.parent_id, []);
      map.get(t.parent_id).push(t.id);
    });
    return map;
  }, [tagsFlat]);

  // Collecte tous les descendants d’un tag
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

  // Construction de l’arborescence des tags
  const tagTree = useMemo(() => {
    const map = new Map();
    tagsFlat.forEach((t) => map.set(t.id, { ...t, children: [] }));
    const roots = [];
    for (const t of map.values()) {
      if (t.parent_id === null || t.parent_id === undefined) {
        roots.push(t);
      } else {
        const parent = map.get(t.parent_id);
        if (parent) parent.children.push(t);
        else roots.push(t);
      }
    }
    return roots;
  }, [tagsFlat]);

  // Filtrage des recettes par recherche et tags
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
        (r.tags || []).some((t) => selectedDescendants.includes(t.id));
      return matchSearch && matchTag;
    });
  }, [recipes, search, selectedTagIds, tagsFlat]);

//   useEffect(() => {
//   // rendre la liste des tags accessible globalement pour RecipeCard
//   window.__ALL_TAGS__ = tagsFlat;
// }, [tagsFlat]);

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8">
      <Header homeId={homeId}/>

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
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

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
