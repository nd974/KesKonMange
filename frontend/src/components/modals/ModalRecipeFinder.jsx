import { useState } from "react";
import IngredientNameInput from "../IngredientNameInput";
import ModalWrapper from "./ModalWrapper";

export default function ModalRecipeFinder({
  onClose,
  onApply,
  ingredients: initialIngredients = [],
  sortCriteria: initialSortCriteria = [],
}) {
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [isValidSuggestion, setIsValidSuggestion] = useState(false);
  
  // ⚡ Tous les critères disponibles
  const availableCriteria = [
    { field: "shop_count", label: "Nombre de magasins a faire", order:"asc"},
    { field: "usage_count", label: "Nombre de fois réalisée" , order:"asc"},
    { field: "note", label: "Note personnelle"},
    { field: "note_general", label: "Note general"},
    { field: "cheaper", label: "Prix des Ingredients manquants", order:"asc"},
    { field: "price", label: "Prix total (bucket 5€)", order:"asc"},
  ];

  // ⚡ State interne des critères, avec active ou non
  const [criteriaState, setCriteriaState] = useState(
    availableCriteria.map((c) => {
      const existing = initialSortCriteria.find((s) => s.field === c.field);
      return {
        ...c,
        active: !!existing,
        order: c?.order || "desc",
      };
    })
  );

  /* ---------------- INGREDIENTS ---------------- */
  function addIngredient() {
    const value = ingredientInput.trim().toLowerCase();
    if (value && !ingredients.includes(value)) {
      setIngredients([...ingredients, value]);
    }
    setIngredientInput("");
  }

  function removeIngredient(name) {
    setIngredients((prev) => prev.filter((i) => i !== name));
  }

  /* ---------------- SORT CRITERIA ---------------- */
  function toggleActive(index) {
    const updated = [...criteriaState];
    updated[index].active = !updated[index].active;
    setCriteriaState(updated);
  }

  function updateOrder(index, order) {
    const updated = [...criteriaState];
    updated[index].order = order;
    setCriteriaState(updated);
  }

  /* ---------------- APPLY ---------------- */
  function handleApply() {
    const sortCriteria = criteriaState
      .filter((c) => c.active)
      .map((c) => ({ field: c.field, order: c.order }));

    onApply({
      ingredients,
      sortCriteria,
    });
    onClose();
  }

  return (
    <ModalWrapper onClose={onClose}>
        <h2 className="text-xl font-semibold mb-4 text-center text-accentGreen">
          Recherche avancée
        </h2>

        {/* INGREDIENTS */}
        <div className="mb-5">
          <label className="font-semibold block mb-1">Ingrédients dans la recette</label>

          <div className="flex gap-2">
            <IngredientNameInput
              value={ingredientInput}
              onChange={(v) => {
                setIngredientInput(v);
                setIsValidSuggestion(false);
              }}
              onSelect={(name) => {
                setIngredientInput(name);
                setIsValidSuggestion(true);
              }}
              showWarning={false} // <-- important
            />


            <button
              onClick={addIngredient}
              disabled={!isValidSuggestion}
              className={`px-3 rounded text-white ${
                isValidSuggestion ? "bg-green-600" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Ajouter
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {ingredients.map((ing) => (
              <span key={ing} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                {ing}
                <button className="text-red-500 font-bold" onClick={() => removeIngredient(ing)}>×</button>
              </span>
            ))}
          </div>
        </div>

        {/* SORT CRITERIA */}
        <div className="mb-5">
          <label className="font-semibold block mb-2">Trier par</label>

          <div className="space-y-2">
            {criteriaState.map((c, i) => (
              <div key={c.field} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={c.active}
                  onChange={() => toggleActive(i)}
                  className="w-4 h-4"
                />
                <span className="flex-1">{c.label}</span>

                <select
                  className="border rounded p-2"
                  value={c.order}
                  onChange={(e) => updateOrder(i, e.target.value)}
                  disabled={!c.active}
                >
                  <option value="desc">Décroissant</option>
                  <option value="asc">Croissant</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* SEARCH BUTTON */}
        <div>
          <button
            onClick={handleApply}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700"
          >
            Rechercher
          </button>
        </div>
    </ModalWrapper>
  );
}
