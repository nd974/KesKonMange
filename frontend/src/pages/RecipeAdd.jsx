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

  // const handleUploadCloud = async (publicMameIdCloud) => {
  //   const fileToUpload = selectedFile || fileInputRef.current?.files[0];

  //   if (!fileToUpload){
  //     return null;
  //   }

  //   console.log(publicMameIdCloud);
  //   setstatusName("Envoi en cours...");

  //   try {
  //     const formData = new FormData();
  //     formData.append("file", fileToUpload);
  //     formData.append("upload_preset", "Recettes");
  //     formData.append("public_id", publicMameIdCloud);

  //     const res = await fetch(
  //       "https://api.cloudinary.com/v1_1/dsnaosp8u/image/upload",
  //       { method: "POST", body: formData }
  //     );

  //     const data = await res.json();
  //     console.log("Réponse Cloudinary :", data);

  //     if (data.secure_url) {
  //       // Transformation Cloudinary pour redimensionner à 1870×1250
  //       const transformedUrl = data.secure_url.replace(
  //         "/upload/",
  //         "/upload/w_1870,h_1250,c_fill/"
  //       );

  //       setstatusName("✅ Image uploadée");

  //       const parts = transformedUrl.split("/upload/w_1870,h_1250,c_fill/");
  //       console.log(parts[1]);
  //       return parts[1];
  //     } else {
  //       setstatusName("❌ Erreur : pas d'URL renvoyée.");
  //       console.log("❌ Erreur : pas d'URL renvoyée.");
  //       return null;
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setstatusName("❌ Erreur lors de l'upload : " + err.message);
  //     console.log("❌ Erreur : pas d'URL renvoyée.");
  //     return null;
  //   }
  // };
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
  const [steps, setSteps] = useState([""]);
  const addStep = () => setSteps([...steps, ""]);
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

  const [modalVisible, setModalVisible] = useState(false);
  const [invalidIngredient, setInvalidIngredient] = useState("");
  const [clickingSuggestion, setClickingSuggestion] = useState(false);



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

    // Si on clique sur une suggestion, ne rien faire
    if (clickingSuggestion) {
      setClickingSuggestion(false);
      return;
    }

    if (!ing.suggestions.includes(ing.name) && !ing.selected && ing.name.trim() !== "") {
      setInvalidIngredient(ing.name);
      setModalVisible(true);
    }
  };


  // Fermeture de la modal
  const confirmIngredient = () => {
    setModalVisible(false);
    setInvalidIngredient("");
  };


  // Lorsque l'utilisateur clique sur une suggestion
  const selectSuggestion = (index, suggestion) => {
    setClickingSuggestion(true); // signaler qu’on clique sur une suggestion
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
      r.steps.map(s => 
          s.step?.length > 3 
            ? s.step.substring(3) 
            : s.step // si trop court
        ) || [""]
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
                max="999"
                value={value}
                onChange={(e) =>
                  setTime({ ...time, [key]: e.target.valueAsNumber })
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
          min="0.01"
          step="0.01"
          placeholder="Qté"
          value={ing.quantity}
          onChange={(e) => handleIngredientChange(i, 'quantity', e.target.valueAsNumber)}

          className="border rounded p-2 w-12 lg:w-1/3"
        />

        {/* Unité (liste déroulante) */}
        <select
          value={ing.unit || ""}
          onChange={(e) => handleIngredientChange(i, "unit", e.target.value)}
          className={`border rounded p-2 w-20 lg:w-1/3 bg-white 
            ${ing.unit ? "text-black" : "text-gray-500"}`}
        >
          <option value="" disabled>
            (g, L, ...)
          </option>

          {units.map((u) => (
            <option key={u.id} value={u.abbreviation}>
              {u.abbreviation} ({u.name})
            </option>
          ))}
        </select>

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
                  onMouseDown={() => selectSuggestion(i, s)}
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

{modalVisible && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded shadow-md w-96">
      <p className="mb-2">
        L'ingrédient <span className="font-bold text-red-600">{invalidIngredient}</span> n'est pas dans les suggestions.
      </p>
      <p className="mb-4">
        Le calcul des valeurs nutritionnelles de la recette ne prendra pas en compte cet ingrédient et il n'aura pas non plus d'image dédiée.
      </p>
      <p className="mb-4">
        Voulez-vous continuer ?
      </p>
      <div className="flex justify-end gap-4">
        <button
          onClick={() => {
            // Annuler : remettre l'ingrédient à vide
            setIngredients((prev) =>
              prev.map((ing) =>
                ing.name === invalidIngredient
                  ? { ...ing, name: "" }
                  : ing
              )
            );
            setModalVisible(false);
            setInvalidIngredient("");
          }}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Annuler
        </button>
        <button
          onClick={() => {
            // Valider : on laisse tel quel
            setModalVisible(false);
            setInvalidIngredient("");
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Valider
        </button>
      </div>
    </div>
  </div>
)}





</section>









        {/* Étapes */}
        <section className="mb-6 items-center" >
          <h2 className="text-xl font-semibold mb-2">👨‍🍳 Étapes de préparation</h2>
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-2 mb-2 items-center">
              <textarea
                rows="2"
                value={s} // déjà stocké avec numéro
                onChange={(e) => {
                  const updated = [...steps];
                  updated[i] = e.target.value; 
                  setSteps(updated);
                }}
                placeholder={`Étape ${i + 1}`}
                className="flex-1 border rounded p-2"
              ></textarea>
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  className="text-red-500 text-lg mt-1"
                >
                  ❌
                </button>
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
