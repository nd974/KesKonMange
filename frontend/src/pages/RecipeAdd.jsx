import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import TagTree from "../components/TagTree";
import { CLOUDINARY_RES, CLOUDINARY_API } from "../config/constants";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function RecipeAdd({ homeId }) {
  const { recipe_id } = useParams();
  const navigate = useNavigate();

  const [recipeName, setRecipeName] = useState("");
  const [recipePicture, setRecipePicture] = useState("");
  const [difficulty, setDifficulty] = useState(3);
  const [portions, setPortions] = useState(null);

  // -------------------- Image --------------------
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusName, setstatusName] = useState("");
  const [statusCSS, setstatusCSS] = useState("");

  const handleFiles = (file) => {
    if (!file) {
      setstatusName("image non reconnu");
      setstatusCSS("red");
      return;
    }
    setSelectedFile(file);
    setstatusName(`Fichier prêt : ${file.name}`);
    setstatusCSS("green");
  };

const handleDeletePicture = async () => {
  try {
    await fetch(`${API_URL}/recipe/delete-image/${recipeName}`, {
      method: "DELETE",
    });

    setRecipePicture(null);
  } catch (e) {
    console.error("Erreur suppression image :", e);
  }
};

const handleUploadCloud = async (publicMameIdCloud) => {
  let fileToUpload = selectedFile || fileInputRef.current?.files[0];

  if (!fileToUpload) {
    return null;
  }

  console.log(publicMameIdCloud);
  setstatusName("Envoi en cours...");

  // 🔵 Compression côté client
  const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, 1);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => resolve(blob),
          "image/jpeg", // ou "image/webp"
          quality
        );
      };
    });
  };

  // 🔹 Appliquer compression
  fileToUpload = await compressImage(fileToUpload, 1200, 0.7);

  try {
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("upload_preset", "Recettes");
    formData.append("public_id", publicMameIdCloud);

    const res = await fetch(
      `${CLOUDINARY_API}`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    console.log("Réponse Cloudinary :", data);

    if (data.secure_url) {
      // Transformation Cloudinary pour redimensionner à 1870×1250
      const transformedUrl = data.secure_url.replace(
        "/upload/",
        "/upload/a_auto,w_1200,h_800,c_fill,f_webp,q_auto/"
      );

      setstatusName("✅ Image uploadée");

      const parts = transformedUrl.split("/upload/a_auto,w_1200,h_800,c_fill,f_webp,q_auto/");
      console.log(parts[1]);
      return parts[1];
    } else {
      setstatusName("❌ Erreur : pas d'URL renvoyée.");
      console.log("❌ Erreur : pas d'URL renvoyée.");
      return null;
    }
  } catch (err) {
    console.error(err);
    setstatusName("❌ Erreur lors de l'upload : " + err.message);
    console.log("❌ Erreur : pas d'URL renvoyée.");
    return null;
  }
};



  // Drag & Drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFiles(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  // -------------------- Temps --------------------
  const [time, setTime] = useState({
    preparation: "",
    cuisson: "",
    repos: "",
    nettoyage: "",
  });

  // -------------------- Étapes --------------------
  const [steps, setSteps] = useState([
  { text: "", level: 0, time: null },
]);
const addStep = () =>
  setSteps([...steps, { text: "", level: 0, time: 0 }]);
  const removeStep = (i) => setSteps(steps.filter((_, index) => index !== i));

  // -------------------- Ustensiles --------------------


  // -------------------- Unités --------------------
  const [units, setUnits] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/unit/get-all`)
      .then(res => res.json())
      .then(data => setUnits(data))
      .catch(err => console.error("Erreur chargement unités:", err));
  }, []);

  // -------------------- Utensils --------------------
  const [utensils, setUtensils] = useState([]);
  const [ustensiles, setUstensiles] = useState([""]);
  const [queries, setQueries] = useState([""]);
  const [openIndex, setOpenIndex] = useState(null);

  const addUstensile = () => {
    setUstensiles([...ustensiles, ""]);
    setQueries([...queries, ""]);
  };
  const removeUstensile = (i) => {
    setUstensiles(ustensiles.filter((_, index) => index !== i));
    setQueries(queries.filter((_, index) => index !== i));
  };



  useEffect(() => {
    fetch(`${API_URL}/utensil/get-all`)
      .then(res => res.json())
      .then(data => setUtensils(data))
      .catch(err => console.error("Erreur chargement utensils:", err));
  }, []);

  // -------------------- Ingrédients --------------------

// -------------------- Ingrédients --------------------
const [ingredients, setIngredients] = useState([
  { name: "", quantity: "", unit: "", suggestions: [], selected: false, warning: false }
]);


// Stocke localIngredients au chargement du composant pour éviter des fetch répétées
const [localIngredients, setLocalIngredients] = useState([]);
const [localRecipes, setlocalRecipes] = useState([]);

const [loadingIngredient, setLoadingIngredient] = useState(null);
const [warningIndex, setWarningIndex] = useState(null);

const [showIngredientInfo, setShowIngredientInfo] = useState(false);

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// const debouncedName = useDebounce(ing.name, 500);
// Dans ton composant RecipeAdd
const debounceRefs = useRef({}); // { [index]: timeoutId }

const debounceSearchIngredient = (index, value) => {
  if (debounceRefs.current[index]) clearTimeout(debounceRefs.current[index]);
  debounceRefs.current[index] = setTimeout(() => {
    searchIngredient(index, value);
    debounceRefs.current[index] = null;
  }, 500); // 500ms suffisent
};


// Charger les ingrédients locaux au démarrage
useEffect(() => {
  const fetchLocalIngredients = async () => {
    try {
      const res = await fetch(`${API_URL}/ingredient/get-all`);
      const data = await res.json();
      setLocalIngredients(data);
    } catch (err) {
      console.error("Erreur chargement ingrédients locaux :", err);
    }
  };
  fetchLocalIngredients();
}, []);

useEffect(() => {
  const fetchLocalRecipes = async () => {
    try {
      const res = await fetch(`${API_URL}/recipe/get-all`);
      const data = await res.json();
      setlocalRecipes(data);
    } catch (err) {
      console.error("Erreur chargement ingrédients locaux :", err);
    }
  };
  fetchLocalRecipes();
}, []);

const suggestionsCache = useRef({}); // { query: suggestions }
const lastQueryRef = useRef("");

const searchIngredient = (index, nameOverride) => {
  const name = (nameOverride || ingredients[index].name.trim()).toLowerCase();
  if (!name || name.length < 3) return; // pas de fetch pour < 3 lettres
  if (name === lastQueryRef.current) return; // éviter les fetch doublons
  lastQueryRef.current = name;

  // 🔹 Suggestions locales
  const localSuggestionsIng = localIngredients
    .filter(ing => ing.name.toLowerCase().includes(name))
    .map(ing => ({ name: ing.name.trim(), isIng: true }));

  const localSuggestionsRec = localRecipes
    .filter(rec => rec.name.toLowerCase().includes(name))
    .map(rec => ({ rec_id:rec.id || null, name: rec.name.trim(), isRec: true }));

  console.log("Suggestions locales ingrédient :", localSuggestionsIng);
  console.log("Suggestions locales recette :", localSuggestionsRec);

  const merged = [...localSuggestionsIng, ...localSuggestionsRec];

  // Set pour tracker les noms déjà vus
  const seenNames = new Set();

  // Filtrer les doublons selon la propriété "name"
  const localSuggestions = merged.filter(item => {
    if (seenNames.has(item.name)) {
      return false; // doublon → ignorer
    }
    seenNames.add(item.name);
    return true; // première occurrence → garder
  });
     

  // Affiche immédiatement les locales
  setIngredients(prev => {
    const updated = [...prev];
    updated[index].suggestions = localSuggestions;
    updated[index].selected = false;
    updated[index].warning = localSuggestions.length === 0;
    return updated;
  });

  // 🔹 Vérifier le cache
  if (suggestionsCache.current[name]) {
    // si cache, on merge les locales + cache
    const cachedSuggestions = suggestionsCache.current[name];
    setIngredients(prev => {
      const updated = [...prev];
      updated[index].suggestions = [...localSuggestions, ...cachedSuggestions];
      return updated;
    });
    return;
  }

  // 🔹 Fetch API OpenFoodFacts en arrière-plan
  (async () => {
    setLoadingIngredient(index);
    try {
      console.log("Fetch Api OpenFact ...");
      const resAPI = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?action=process&search_terms=${encodeURIComponent(
          name
        )}&search_simple=1&json=1&page_size=10`
      );
      console.log("Fetch fini .");
      const dataAPI = await resAPI.json();

      const apiSuggestions = (dataAPI.products || [])
        .map(p => p.product_name)
        .filter(Boolean)
        .map(s => s.trim())
        .filter(s => s.toLowerCase().includes(name))
        .map(s => ({ name: s, isLocal: false }));

      // 🔹 Fusion locales + API
      console.log("Fusion suggestions...");
      const suggestions = [...localSuggestions, ...apiSuggestions];

      // 🔹 Mettre à jour le cache
      suggestionsCache.current[name] = apiSuggestions;

      // 🔹 Mettre à jour le state
      setIngredients(prev => {
        const updated = [...prev];
        updated[index].suggestions = suggestions;
        updated[index].warning = suggestions.length === 0;
        return updated;
      });
      console.log("Affichage suggestions.");
    } catch (err) {
      console.error("Erreur fetch API OpenFoodFacts :", err);
      setIngredients(prev => {
        const updated = [...prev];
        updated[index].warning = true;
        return updated;
      });
    } finally {
      setLoadingIngredient(null);
    }
  })();
};








// Sélection d'une suggestion
const selectSuggestion = (index, suggestion) => {
  setIngredients(prev => {
    const updated = [...prev];
    updated[index] = {
      ...updated[index],
      name: suggestion,
      selected: true,
      suggestions: [], 
      error: false
    };
    return updated;
  });
};

// Ajout / suppression
const addIngredient = () =>
  setIngredients(prev => [...prev, { name: "", quantity: "", unit: "", suggestions: [], selected: false }]);

const removeIngredient = (index) =>
  setIngredients(prev => prev.filter((_, i) => i !== index));


  // -------------------- Tags --------------------
  const [search, setSearch] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [tagsFlat, setTagsFlat] = useState([]);
  const [tagTree, setTagTree] = useState([]);

  function buildTree(flatTags) {
    const map = {};
    const roots = [];

    flatTags.forEach((tag) => {
      map[tag.id] = { ...tag, children: [] };
    });

    flatTags.forEach((tag) => {
      if (tag.parent_id) {
        map[tag.parent_id]?.children.push(map[tag.id]);
      } else {
        roots.push(map[tag.id]);
      }
    });

    return roots;
  }

  useEffect(() => {
    fetch(`${API_URL}/tag/get-all`)
      .then((r) => r.json())
      .then((data) => {
        setTagsFlat(data);
        setTagTree(buildTree(data));
      })
      .catch((err) => console.error("Erreur de chargement des tags:", err));
  }, []);

  const filterTree = (nodes, term) => {
    if (!term.trim()) return nodes;
    const lowerTerm = term.toLowerCase();

    return nodes
      .map((node) => {
        if (node.name.toLowerCase().includes(lowerTerm)) return node;
        if (node.children) {
          const filteredChildren = filterTree(node.children, term);
          if (filteredChildren.length > 0)
            return { ...node, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean);
  };

  const filteredTagTree = useMemo(
    () => filterTree(tagTree, search),
    [tagTree, search]
  );

  // -------------------- Soumission --------------------
const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    recipeName,
    time,
    portions,
    difficulty,
    selectedTagIds,
    ingredients,
    ustensiles,
    steps,
  };

  let recipeId = recipe_id;

  if (!recipe_id) {
    // 📌 Création
    const resRecipeCreate = await fetch(`${API_URL}/recipe/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const dataRecipeCreate = await resRecipeCreate.json();
    if (!dataRecipeCreate.ok) {
      if (dataRecipeCreate.details && Array.isArray(dataRecipeCreate.details)) {
        alert("❌ Champs manquants :\n" + dataRecipeCreate.details.join("\n"));
      } else {
        alert("❌ Erreur: " + dataRecipeCreate.error);
      }
      return;
    }

    recipeId = dataRecipeCreate.recipeId;
  } else {
    // ✏️ Modification
    const resRecipeEdit = await fetch(`${API_URL}/recipe/update/${recipe_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const dataRecipeEdit = await resRecipeEdit.json();
    if (!dataRecipeEdit.ok) {
      if (dataRecipeEdit.details && Array.isArray(dataRecipeEdit.details)) {
        alert("❌ Champs manquants :\n" + dataRecipeEdit.details.join("\n"));
      } else {
        alert("❌ Erreur: " + dataRecipeEdit.error);
      }
      return;
    }
  }

  // Upload image si nouvelle image sélectionnée
  let pictureName = null;
  if (selectedFile) {
    pictureName = await handleUploadCloud(recipeName);

    await fetch(`${API_URL}/recipe/setImage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId, pictureName }),
    });
  }

  alert(recipe_id ? "Recette modifiée" : "✅Recette créée");
  navigate(`/recipe/${recipeId}`);
};


  //
  // Charger recette si modification
useEffect(() => {
  if (!recipe_id) return;

  const loadRecipe = async () => {
    try {
      const res = await fetch(`${API_URL}/recipe/get-one/${recipe_id}`);
      if (!res.ok) {
        console.error("Erreur serveur :", res.status);
        return;
      }

      const r = await res.json();

      console.log("Recette chargée :", r);

      // Nom
      setRecipeName(r.name);

      // Difficulté
      setDifficulty(r.level);

      // Portions
      setPortions(r.portion);

      // Image
      setRecipePicture(r.picture);

      // Temps
      setTime({
        preparation: r.time_prep ?? "",
        cuisson: r.time_cook ?? "",
        repos: r.time_rest ?? "",
        nettoyage: r.time_clean ?? "",
      });

      // Étapes
      setSteps(
        r.steps
          ?.sort((a, b) => a.number - b.number) // au cas où ce n’est pas trié
          .map(s => ({
            text: s.description || "",
            level: s.level ?? 0,
            time: s.time ?? 0,
            number: s.number ?? 1
          }))
      );

      // Tags = tableau d'objets → on garde seulement l'ID
      setSelectedTagIds(r.tags.map(t => t.id));

      // Ustensiles
      setUstensiles(r.utensils.map(u => u.name));
      setQueries(r.utensils.map(u => u.name));

      // Ingrédients
      setIngredients(
        r.ingredients.map(ing => ({
          name: ing.name,
          quantity: ing.amount,
          unit: ing.unit,
          suggestions: [],
          selected: true,
        }))
      );

    } catch (err) {
      console.error("Erreur chargement recette :", err);
    }
  };

  loadRecipe();
}, [recipe_id]);


const StarRating = ({ value, onChange }) => {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((n) => (
        <span
          key={n}
          onClick={() => onChange(n)}
          className={`cursor-pointer text-xl ${
            n <= value ? "text-yellow-500" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8 relative bg-gray-50">
      <Header homeId={homeId} />

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8 mt-6"
      >
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          {recipe_id ? "✏️ Modifier la recette" : "➕ Ajouter une nouvelle recette"}
        </h1>

        {recipePicture ? (
          <div className="relative w-full">
            <img 
              src={`${CLOUDINARY_RES}${recipePicture}`}
              alt="recipeName"
              className="w-full h-80 object-cover rounded-md mb-6"
            />

            {/* Bouton poubelle */}
            <button
              type="button"
              onClick={handleDeletePicture}
              className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full shadow hover:bg-red-700 transition"
            >
              🗑️
            </button>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current.click()}
            className={`border-2 border-dashed rounded p-4 cursor-pointer transition ${
              dragOver ? "border-green-600 bg-green-50" : "border-gray-400"
            }`}
          >
            <label className="block font-semibold mb-2">Image de la recette</label>
            <p className="text-gray-500 mt-2">
              Glisse et dépose ton image ici ou clique pour choisir un fichier
            </p>

            {/* Input caché */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files[0])}
            />
          </div>
        )}

        {/* 🔥 Ici ton p > il doit être en dehors du ternaire */}
        <p className="mt-4 text-white" style={{ backgroundColor: statusCSS }}>
          {statusName}
        </p>



        {/* Nom */}
        <div className="mb-6 py-8">
          <label className="block font-semibold mb-2">
            Nom de la recette{" "}
            {recipe_id && recipePicture && (
              <span className="font-bold text-red-600">
                (pas modifiable : recharger l'image)
              </span>
            )}
          </label>
          <input
            type="text"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            placeholder="Ex: Pâtes à la carbonara"
            className="w-full border rounded p-2"
            disabled={!!recipe_id && recipePicture}
          />
        </div>

        {/* Tags */}
        <div className="mb-8">
          <label className="block font-semibold mb-2">Tags</label>
          <input
            type="text"
            placeholder="Rechercher un tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded p-2 mb-3"
          />

          <div className="border rounded p-3 bg-gray-50 max-h-80 overflow-auto">
            <TagTree
              tagsFlat={tagsFlat}
              tagTree={filteredTagTree}
              selectedTagIds={selectedTagIds}
              setSelectedTagIds={setSelectedTagIds}
              isOpen={true}
            />
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

                    {/* Croix rouge */}
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

        {/* Temps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {Object.entries(time).map(([key, value]) => (
            <div key={key}>
              <label className="block font-semibold mb-1 capitalize">
                {key} (min)
              </label>
              <input
                type="number"
                min="0"
                max="9999"
                value={value}
                onChange={(e) =>
                  setTime({ ...time, [key]: e.target.value ? e.target.valueAsNumber : "" })
                }

                className="w-full border rounded p-2"
              />
            </div>
          ))}
        </div>

        {/* Difficulté & Portions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-semibold mb-2">Difficulté</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="w-full border rounded p-2"
            >
              <option value={1}>Très facile</option>
              <option value={2}>Facile</option>
              <option value={3}>Moyenne</option>
              <option value={4}>Difficile</option>
              <option value={5}>Très difficile</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2">Portions</label>
            <input
              type="number"
              min="1"
              max="100"
              value={portions}
              onChange={(e) => 
                setPortions(e.target.valueAsNumber)
              }
              className="w-full border rounded p-2"
            />
          </div>
        </div>

        {/* Ustensiles */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">🧂 Ustensiles nécessaires</h2>

          {ustensiles.map((u, i) => {
            const query = queries[i] || "";
            const isValid = utensils.some(item => item.name.toLowerCase() === query.toLowerCase());

            const filtered = utensils.filter(item =>
              item.name.toLowerCase().includes(query.toLowerCase())
            );

            return (
              <div key={i} className="flex flex-col mb-4 relative">

                {/* Barre de recherche */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={query}
                    onFocus={() => setOpenIndex(i)}
                    onChange={(e) => {
                      const newQueries = [...queries];
                      newQueries[i] = e.target.value;
                      setQueries(newQueries);

                      const updated = [...ustensiles];
                      updated[i] = e.target.value;
                      setUstensiles(updated);

                      setOpenIndex(i);
                    }}
                    placeholder={`Ustensile ${i + 1}`}
                    className={`flex-1 border rounded p-2 
                      ${query !== "" && !isValid ? "border-red-500 border-2" : ""}`}
                  />



                  <button
                    type="button"
                    onClick={() => removeUstensile(i)}
                    className="text-red-500 text-lg"
                  >
                    ❌
                  </button>
                </div>

                {/* Liste filtrée */}
                {openIndex === i && query && filtered.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full bg-white border rounded shadow-lg z-50">
                    {filtered.map((item) => (
                      <li
                        key={item.id}
                        onMouseDown={(e) => {
                          e.preventDefault(); // ← empêche la perte de focus avant le clic

                          const updatedUstensiles = [...ustensiles];
                          updatedUstensiles[i] = item.name;
                          setUstensiles(updatedUstensiles);

                          const updatedQueries = [...queries];
                          updatedQueries[i] = item.name;
                          setQueries(updatedQueries);

                          setOpenIndex(null); // ← on ferme la liste
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {item.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={addUstensile}
            className="text-blue-600 text-sm hover:underline"
          >
            + Ajouter un ustensile
          </button>
        </section>

        {/* Ingrédients */}
{/* Ingrédients */}
<section className="mb-6">
<h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
  🥕 Ingrédients nécessaires

  {/* Bouton info */}
  <button
    type="button"
    onClick={() => setShowIngredientInfo(true)}
    className="text-gray-400 hover:text-gray-600 text-lg font-bold flex items-center"
  >
    ℹ️
  </button>
</h2>

{ingredients.map((ing, i) => (
  <div key={i} className="flex items-center gap-2 mb-3">

    {/* Quantité */}
    <input
      type="number"
      min="0"
      step="0.01"
      value={ing.quantity}
      onChange={(e) =>
        setIngredients(prev => {
          const updated = [...prev];
          updated[i].quantity = e.target.value;
          return updated;
        })
      }
      className="border rounded p-2 w-20"
      placeholder="Qté"
    />

    {/* Unité */}
    <select
      value={ing.unit}
      onChange={(e) =>
        setIngredients(prev => {
          const updated = [...prev];
          updated[i].unit = e.target.value;
          return updated;
        })
      }
      className="border rounded p-2 w-18 bg-white"
    >
      <option value="">-</option>
      {units.map((u) => (
        <option key={u.id} value={u.abbreviation}>
          {u.abbreviation}
        </option>
      ))}
    </select>

    {/* Nom + Loupe */}
    <div className="relative flex-1">

<input
  type="text"
  value={ing.name}
  onChange={(e) => {
    const inputValue = e.target.value;
    setIngredients(prev => {
      const updated = [...prev];
      updated[i].name = inputValue;
      updated[i].selected = false;
      // ⚠️ NE PAS toucher aux suggestions ici
      return updated;
    });

    debounceSearchIngredient(i, inputValue); // lance la recherche
  }}
  className={`border rounded p-2 w-full pr-16 ${
    ing.warning ? "border-orange-400 border-2" : "border-gray-300"
  }`}
  placeholder="Nom ingrédient"
/>



      {/* 🟧 Icône warning */}
      {ing.warning && (
        <button
          type="button"
          onClick={() => setWarningIndex(i)}
          className="absolute right-10 top-1/2 -translate-y-1/2 text-orange-500 font-bold"
        >
          i
        </button>
      )}

      {/* 🔍 Loupe */}
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
        onClick={() => {
          lastQueryRef.current = "";     // ← obligatoire
          searchIngredient(i, ingredients[i].name); 
        }}
      >
        {loadingIngredient === i ? "⏳" : "🔍"}
      </button>


      {/* Suggestions */}
      {ing.suggestions.length > 0 && (
        <ul className="absolute bg-white border rounded shadow w-full mt-1 z-50 max-h-40 overflow-auto">
          {ing.suggestions
            .sort((a, b) => (b.isLocal ? 1 : 0) - (a.isLocal ? 1 : 0)) // locales en haut
            .map((s, j) => (
              <li
                key={j}
                className={`p-2 hover:bg-gray-100 cursor-pointer ${
                  s.isRec ? "text-orange-600" : s.isIng ? "text-green-600" : "text-yellow-600"
                }`}
                onMouseDown={() => selectSuggestion(i, s.name)}
              >
                {s.name}
              </li>
            ))}
        </ul>
      )}
    </div>

    {/* Supprimer l’ingrédient */}
    <button
      className="text-red-500"
      type="button"
      onClick={() => removeIngredient(i)}
    >
      ❌
    </button>
  </div>
))}

  <button
    type="button"
    onClick={addIngredient}
    className="text-blue-600 hover:underline mt-3"
  >
    + Ajouter un ingrédient
  </button>

{/* ⚠️ Popin warning pour l’ingrédient */}
{warningIndex !== null && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    onClick={() => setWarningIndex(null)} // clic en dehors ferme la popin
  >
    <div
      className="bg-white rounded-lg p-6 max-w-sm w-full relative"
      onClick={(e) => e.stopPropagation()} // empêche fermeture si clic à l'intérieur
    >
      <h3 className="text-lg font-semibold text-orange-500 mb-2">
        ⚠️ Attention
      </h3>
      <p className="text-gray-700">
        L’ingrédient que vous avez saisi n’est pas reconnu ou n’a pas de suggestions valides.
      </p>
      <div className="text-right mt-4">
        <button
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          onClick={() => setWarningIndex(null)}
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}

  {showIngredientInfo && (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setShowIngredientInfo(false)} // clic en dehors ferme la popin
    >
      <div
        className="bg-white rounded-lg p-6 max-w-sm w-full relative"
        onClick={(e) => e.stopPropagation()} // empêche fermeture si clic à l'intérieur
      >
        <h3 className="text-lg font-semibold mb-2">ℹ️ Informations sur les suggestions</h3>
        <p className="text-gray-700 mb-2">
          Les suggestions <span className="font-bold text-accentGreen">en vert [Ingredient]</span> proviennent de notre base de données.
        </p>
        <p className="text-gray-700 mb-2">
          Les suggestions <span className="font-bold text-orange-600">en orange [Recette]</span> proviennent de notre base de données.
        </p>
        <p className="text-gray-700">
          Les suggestions <span className="font-bold text-yellow-600">en beige</span> proviennent de l’API OpenFoodFacts.
        </p>
        <div className="text-right mt-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setShowIngredientInfo(false)}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )}

</section>

        {/* Étapes */}
        <section className="mb-6 items-center" >
          <h2 className="text-xl font-semibold mb-2">👨‍🍳 Étapes de préparation</h2>
{steps.map((step, i) => (
  <div
    key={i}
    className="flex flex-col gap-3 p-3 mb-4 border rounded bg-gray-50"
  >
    {/* Texte de l'étape */}
    <textarea
      rows="2"
      value={step.text}
      onChange={(e) => {
        const updated = [...steps];
        updated[i].text = e.target.value;
        setSteps(updated);
      }}
      placeholder={`Étape ${i + 1}`}
      className="w-full border rounded p-2"
    ></textarea>

    {/* Level + Temps */}
    <div className="flex items-center gap-6">

      {/* Level ⭐ */}
      <div>
        <label className="font-semibold text-sm">Difficulté</label>
        <StarRating
          value={step.level}
          onChange={(lvl) => {
            const updated = [...steps];
            updated[i].level = lvl;
            setSteps(updated);
          }}
        />
      </div>

      {/* Time (min) */}
      <div>
        <label className="font-semibold text-sm">Temps (min)</label>
        <input
          type="number"
          min="0"
          max="9999"
          value={step.time}
          onChange={(e) => {
            const updated = [...steps];
            updated[i].time = e.target.valueAsNumber;
            setSteps(updated);
          }}
          className="border rounded p-2 w-20"
        />
      </div>

      <button
        type="button"
        onClick={() => removeStep(i)}
        className="text-red-500 text-lg ml-auto"
      >
        ❌
      </button>

    </div>
  </div>
))}


          <button
            type="button"
            onClick={addStep}
            className="text-blue-600 text-sm hover:underline"
          >
            + Ajouter une étape
          </button>
        </section>

        {/* Bouton final */}
        <div className="text-center mt-8">
          <button
            type="submit"
            className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            {recipe_id ? "✏️ Modifier la recette" : "✅ Ajouter la recette"}
          </button>
        </div>
      </form>
    </div>
  );
}