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
    { quantity: "", unit: "", name: "" },
  ]);

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { quantity: "", unit: "", name: "" }]);
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

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

          {selectedTagIds.length > 0 && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">Tags sélectionnés :</span>{" "}
              {selectedTagIds.join(", ")}
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
  <h2 className="text-xl font-semibold mb-2">
    🥕 Ingrédients nécessaires
  </h2>

  <div className="space-y-3">
    {ingredients.map((ing, i) => (
      <div
        key={i}
        className="
          flex items-center gap-2
          lg:grid lg:grid-cols-3 lg:gap-3
        "
      >
        {/* Quantité */}
        <input
          type="number"
          placeholder="Qté"
          value={ing.quantity}
          onChange={(e) =>
            handleIngredientChange(i, 'quantity', e.target.value)
          }
          className="w-12 sm:w-20 border rounded p-2 flex-shrink-0 lg:w-full"
        />

        {/* Unité */}
        <input
          type="text"
          placeholder="Unité"
          value={ing.unit}
          onChange={(e) =>
            handleIngredientChange(i, 'unit', e.target.value)
          }
          className="w-20 sm:w-24 border rounded p-2 flex-shrink-0 lg:w-full"
        />

        {/* Ingrédient avec recherche */}
        <div className="flex items-center gap-2 flex-1 lg:w-full">
          <input
            list="ingredient-list"
            placeholder="Nom ingrédient"
            value={ing.name}
            onChange={(e) =>
              handleIngredientChange(i, 'name', e.target.value)
            }
            className="w-20 sm:w-24 flex-1 border rounded p-2 min-w-[120px] lg:w-full"
          />
          {i > 0 && (
            <button
              type="button"
              onClick={() => removeIngredient(i)}
              className="text-red-500 text-lg flex-shrink-0"
            >
              ❌
            </button>
          )}
        </div>
      </div>
    ))}
  </div>

  {/* Liste d’ingrédients disponibles */}
  <datalist id="ingredient-list">
    <option value="Farine" />
    <option value="Sucre" />
    <option value="Beurre" />
    <option value="Œufs" />
    <option value="Lait" />
    <option value="Sel" />
    <option value="Huile d’olive" />
  </datalist>

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
