import React, { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function IngredientNameInput({
  value,
  onChange,
  onSelect,
  allowRemove = false,
  onRemove,
  placeholder = "Nom ingrédient",

  showWarning = true, // <-- nouvelle prop

  disabled = false,

  onSuggestionsChange,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [warning, setWarning] = useState(false);

  const [localIngredients, setLocalIngredients] = useState([]);
  const [localRecipes, setLocalRecipes] = useState([]);

  const debounceRef = useRef(null);
  const cacheRef = useRef({});

  const [warningmodal, setwarningmodal] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/ingredient/get-all`)
      .then((r) => r.json())
      .then(setLocalIngredients)
      .catch(console.error);

    fetch(`${API_URL}/recipe/get-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeId: null, profileId: null }),
    })
      .then((r) => r.json())
      .then(setLocalRecipes)
      .catch(console.error);
  }, []);


  const normalizeStr = (str) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const search = (q) => {
    const name = normalizeStr(q.trim().toLowerCase());
    if (name.length < 2) {
      setSuggestions([]);
      setWarning(false);
      return;
    }

    if (cacheRef.current[name]) {
      setSuggestions(cacheRef.current[name]);
      setWarning(cacheRef.current[name].length === 0);
      return;
    }

    const ingMatches = localIngredients
      .filter((i) => normalizeStr(i.name.toLowerCase()).includes(name))
      .map((i) => ({ name: i.name, isIng: true }));

    const recMatches = localRecipes
      .filter((r) => normalizeStr(r.name.toLowerCase()).includes(name))
      .map((r) => ({ name: r.name, isRec: true }));

    const merged = [...recMatches, ...ingMatches];

    cacheRef.current[name] = merged;
    setSuggestions(merged);
    setWarning(merged.length === 0);
  };

  const handleChange = (v) => {
    onChange(v);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      search(v);
    }, 350);
  };

  useEffect(() => {
    onSuggestionsChange?.(suggestions);
  }, [suggestions]);

  return (
    <div className="relative flex items-center gap-2 flex-1">
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`border rounded p-2 w-full ${
          warning ? "border-orange-400 border-2" : "border-gray-300"
        }`}
      />

      {warning && showWarning && (
        <button
          type="button"
          onClick={() => setwarningmodal(true)}
          className="text-orange-500"
        >
          ⚠️
        </button>
      )}

      {allowRemove && onRemove && (
        <button className="text-red-500" onClick={onRemove}>
          ❌
        </button>
      )}

      {suggestions.length > 0 && (
        <ul className="absolute left-0 top-full bg-white border rounded shadow w-full mt-1 z-50 max-h-40 overflow-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => {
                onSelect?.(s.name);
                setSuggestions([]);
              }}
              className={`p-2 hover:bg-gray-100 cursor-pointer ${
                s.isRec ? "text-orange-600" : "text-green-600"
              }`}
            >
              {s.name}
            </li>
          ))}
        </ul>
      )}

      {warningmodal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setwarningmodal(false)} // clic en dehors ferme la popin
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm w-full relative"
            onClick={(e) => e.stopPropagation()} // empêche fermeture si clic à l'intérieur
          >
            <h3 className="text-lg font-semibold text-orange-500 mb-2">
              ⚠️ Attention
            </h3>
            <p className="text-gray-700">
              L’ingrédient est introuvable. <br /><br />
              Veuillez vérifier l’orthographe et mettre la premiere lettre en majuscule afin de le stocker en BDD.
            </p>
            <div className="text-right mt-4">
              <button
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                onClick={() => setwarningmodal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
