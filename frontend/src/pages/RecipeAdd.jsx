import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import TagTree from "../components/TagTree";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function RecipeAdd({ homeId }) {
  const navigate = useNavigate();

  const [recipeName, setRecipeName] = useState("");
  const [difficulty, setDifficulty] = useState(3);
  const [portions, setPortions] = useState(2);

  

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

  const handleUploadCloud = async (publicMameIdCloud) => {
    const fileToUpload = selectedFile || fileInputRef.current?.files[0];

    if (!fileToUpload){
      return null;
    }

    console.log(publicMameIdCloud);
    setstatusName("Envoi en cours...");

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("upload_preset", "Recettes");
      formData.append("public_id", publicMameIdCloud);

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dsnaosp8u/image/upload",
        { method: "POST", body: formData }
      );

      const data = await res.json();
      console.log("Réponse Cloudinary :", data);

      if (data.secure_url) {
        // Transformation Cloudinary pour redimensionner à 1870×1250
        const transformedUrl = data.secure_url.replace(
          "/upload/",
          "/upload/w_1870,h_1250,c_fill/"
        );

        setstatusName("✅ Image uploadée");

        const parts = transformedUrl.split("/upload/w_1870,h_1250,c_fill/");
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
    preparation: 10,
    cuisson: 15,
    repos: 0,
    nettoyage: 5,
  });

  // -------------------- Étapes --------------------
  const [steps, setSteps] = useState([""]);
  const addStep = () => setSteps([...steps, ""]);
  const removeStep = (i) => setSteps(steps.filter((_, index) => index !== i));

  // -------------------- Ustensiles --------------------
  const [ustensiles, setUstensiles] = useState([""]);
  const addUstensile = () => setUstensiles([...ustensiles, ""]);
  const removeUstensile = (i) =>
    setUstensiles(ustensiles.filter((_, index) => index !== i));

  // -------------------- Ingrédients --------------------

  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "", suggestions: [], selected: false }
  ]);

  const [debouncedNames, setDebouncedNames] = useState(
    ingredients.map((ing) => ing.name)
  );

  const [focusedInput, setFocusedInput] = useState(null);

  // Debounce global des noms d'ingrédients
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedNames(ingredients.map((ing) => ing.name));
    }, 500); // tu peux ajuster le temps
    return () => clearTimeout(handler);
  }, [ingredients]);

  // Fetch suggestions dès que les noms sont "debounced"
  // et seulement si l'ingrédient n'est pas "selected"
  useEffect(() => {
    debouncedNames.forEach((debouncedName, index) => {
      if (!debouncedName || ingredients[index]?.selected) return;

      const fetchSuggestions = async () => {
        try {
          const res = await fetch(`
            ${API_URL}/api/openfoodfacts?q=${encodeURIComponent(debouncedName)}`
          );
          const suggestions = await res.json();

          // Filtrer les additifs commençant par E et ne garder que ceux qui contiennent la recherche
          const filteredSuggestions = (suggestions || [])
            .filter(s => !/^E\d+/i.test(s)) // supprime additifs
            .filter(s => s.toLowerCase().includes(debouncedName.toLowerCase())); // doit contenir la recherche

          setIngredients((prev) => {
            const updated = [...prev];
            // seulement si l'input n'est pas sélectionné
            if (!updated[index].selected) {
              updated[index].suggestions = filteredSuggestions;
            }
            return updated;
          });
        } catch (err) {
          console.error("Erreur fetch suggestions:", err);
        }
      };


      fetchSuggestions();
    });
  }, [debouncedNames]);

  // Au moment de changer l'input, on laisse tout passer
  const handleIngredientChange = (index, field, value) => {
    setIngredients((prev) =>
      prev.map((ing, i) =>
        i === index
          ? { ...ing, [field]: value, ...(field === "name" ? { selected: false } : {}) }
          : ing
      )
    );
  };

  // Au moment de sortir de l'input
  const handleIngredientBlur = (index) => {
    const ing = ingredients[index];
    // Si la valeur n'est pas dans suggestions et n'a pas été sélectionnée
    if (!ing.suggestions.includes(ing.name) && !ing.selected) {
      setIngredients((prev) =>
        prev.map((ing2, i) =>
          i === index ? { ...ing2, name: "" } : ing2
        )
      );
    }
  };



  // Lorsque l'utilisateur clique sur une suggestion
  const selectSuggestion = (index, suggestion) => {
    setIngredients((prev) =>
      prev.map((ing, i) =>
        i === index
          ? { ...ing, name: suggestion, suggestions: [], selected: true }
          : ing
      )
    );
  };

  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { quantity: "", unit: "", name: "", suggestions: [], selected: false },
    ]);
  };

  function removeIngredient(index) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }


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

    const pictureName = await handleUploadCloud(recipeName);

    // A SUPPRIMER
    const recipeData = {
      name: recipeName,
      difficulty,
      portions,
      time,
      ustensiles: ustensiles.filter((u) => u.trim() !== ""),
      ingredients: ingredients.filter((i) => i.name.trim() !== ""),
      steps: steps.filter((s) => s.trim() !== ""),
      tags: selectedTagIds,
    };
    console.log("🧾 Données de la recette :", recipeData);

    // CRéation de la recipe de base sans liaison
    const resRecipeCreate = await fetch(`${API_URL}/recipe/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeName, time, portions, difficulty, pictureName, selectedTagIds }),
    });
    const dataRecipeCreate = await resRecipeCreate.json();if (!dataRecipeCreate.ok){alert("❌ Erreur: " + dataRecipeCreate.error);return; }

    console.log("resRecipeCreate", resRecipeCreate);
    console.log("dataRecipeCreate", dataRecipeCreate);


    alert("✅ Recette crée")
    navigate(`/recipe/${dataRecipeCreate.recipeId}`, { replace: true });
    
  };

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8 relative bg-gray-50">
      <Header homeId={homeId} />

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8 mt-6"
      >
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          ➕ Ajouter une nouvelle recette
        </h1>

        {/* Image Upload */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current.click()} // seul déclencheur du clic
          className={`border-2 border-dashed rounded p-4 cursor-pointer transition ${
            dragOver ? "border-green-600 bg-green-50" : "border-gray-400"
          }`}
        >
          <label className="block font-semibold mb-2">Image de la recette</label>
          <p className="text-gray-500 mt-2">
            Glisse et dépose ton image ici ou clique pour choisir un fichier
          </p>
          {/* Input complètement caché */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files[0])}
          />
        </div>

        <p className="mt-4 text-white" style={{ backgroundColor: statusCSS }}>
          {statusName}
        </p>

        {/* Nom */}
        <div className="mb-6 py-8">
          <label className="block font-semibold mb-2">Nom de la recette</label>
          <input
            type="text"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            placeholder="Ex: Pâtes à la carbonara"
            className="w-full border rounded p-2"
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

          {/* {selectedTagIds.length > 0 && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">Tags sélectionnés :</span>{" "}
              {selectedTagIds.join(", ")}
            </div>
          )} */}
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
                max="999"
                value={value}
                onChange={(e) =>
                  setTime({ ...time, [key]: e.target.valueAsNumber || 0 })
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
                setPortions(e.target.valueAsNumber || 0)
              }
              className="w-full border rounded p-2"
            />
          </div>
        </div>

        {/* Ustensiles */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">🧂 Ustensiles nécessaires</h2>
          {ustensiles.map((u, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={u}
                onChange={(e) => {
                  const updated = [...ustensiles];
                  updated[i] = e.target.value;
                  setUstensiles(updated);
                }}
                placeholder={`Ustensile ${i + 1}`}
                className="flex-1 border rounded p-2"
              />
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => removeUstensile(i)}
                  className="text-red-500 text-lg"
                >
                  ❌
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addUstensile}
            className="text-blue-600 text-sm hover:underline"
          >
            + Ajouter un ustensile
          </button>
        </section>






































































        {/* Ingrédients */}
<section className="mb-6">
  <h2 className="text-xl font-semibold mb-2">🥕 Ingrédients nécessaires</h2>

  <div className="space-y-3">
    {ingredients.map((ing, i) => (
      <div
        key={i}
        className="flex items-center gap-2 lg:flex-row lg:items-center"
      >
        {/* Quantité */}
        <input
          type="number"
          min="1"
          step="0.01"
          placeholder="Qté"
          value={ing.quantity}
          onChange={(e) => handleIngredientChange(i, 'quantity', e.target.valueAsNumber || 1)}

          className="border rounded p-2 w-12 lg:w-1/3"
        />

        {/* Unité */}
        <input
          type="text"
          placeholder="Unité"
          value={ing.unit}
          onChange={(e) => handleIngredientChange(i, 'unit', e.target.value)}
          className="border rounded p-2 w-16 lg:w-1/3"
        />

        {/* Nom ingrédient */}
        <div className="relative w-full lg:w-1/3">
          <input
            type="text"
            placeholder="Nom ingrédient"
            value={ing.name}
            onChange={(e) => handleIngredientChange(i, 'name', e.target.value)}
            onFocus={() => setFocusedInput(i)}
            onBlur={() => handleIngredientBlur(i)}
            className="border rounded p-2 w-full pr-8"
          />




          {ing.suggestions && ing.suggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border rounded w-full mt-1 max-h-40 overflow-auto">
              {ing.suggestions.map((s, j) => (
                <li
                  key={j}
                  className="p-1 hover:bg-gray-200 cursor-pointer"
                  onClick={() => selectSuggestion(i, s)}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}

          {/* <button
            type="button"
            onClick={() => removeIngredient(i)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 text-lg"
          >
            ❌
          </button> */}
          
        </div>
        <button
            type="button"
            onClick={() => removeIngredient(i)}
          >
            ❌
        </button>
      </div>
    ))}
  </div>

  <button
    type="button"
    onClick={addIngredient}
    className="text-blue-600 text-sm hover:underline mt-3 block"
  >
    + Ajouter un ingrédient
  </button>
</section>









        {/* Étapes */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">👨‍🍳 Étapes de préparation</h2>
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-2 mb-2">
              <textarea
                rows="2"
                value={s}
                onChange={(e) => {
                  const updated = [...steps];
                  updated[i] = e.target.value;
                  setSteps(updated);
                }}
                placeholder={`Étape ${i + 1}`}
                className="flex-1 border rounded p-2"
              ></textarea>
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  className="text-red-500 text-lg mt-1"
                >
                  ❌
                </button>
              )}
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
            ✅ Ajouter la recette
          </button>
        </div>
      </form>
    </div>
  );
}
