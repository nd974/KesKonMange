import { useState } from "react";

export default function ModalRecipeFinder({ onClose, onApply, ingredients: initialIngredients = [], sortCriteria: initialSortCriteria = [] }) {
  // Inputs
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState(initialIngredients);

  // Trier par multiple
  const [sortCriteria, setSortCriteria] = useState(initialSortCriteria);

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
  function updateSort(index, field) {
    const updated = [...sortCriteria];
    updated[index].field = field;
    setSortCriteria(updated);
  }

  function updateOrder(index, order) {
    const updated = [...sortCriteria];
    updated[index].order = order;
    setSortCriteria(updated);
  }

  function addSortCriterion() {
    setSortCriteria([...sortCriteria, { field: "usage_count", order: "desc" }]);
  }

  function removeSortCriterion(index) {
    setSortCriteria(sortCriteria.filter((_, i) => i !== index));
  }

  /* ---------------- APPLY ---------------- */
  function handleApply() {
    // On envoie la config au parent
    onApply({
      ingredients,
      sortCriteria,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recherche avancée</h2>
          <button onClick={onClose} className="text-xl text-gray-500">✕</button>
        </div>

        {/* INGREDIENTS */}
        <div className="mb-5">
          <label className="font-semibold block mb-1">
            Ingrédients disponibles
          </label>

          <div className="flex gap-2">
            <input
              className="flex-1 border rounded p-2"
              placeholder="Ex : pomme de terre"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addIngredient()}
            />
            <button
              onClick={addIngredient}
              className="px-3 bg-green-600 text-white rounded"
            >
              Ajouter
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {ingredients.map((ing) => (
              <span
                key={ing}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {ing}
                <button
                  className="text-red-500 font-bold"
                  onClick={() => removeIngredient(ing)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* SORT CRITERIA */}
        <div className="mb-5">
          <label className="font-semibold block mb-2">Trier par</label>
          <div className="space-y-2">
            {sortCriteria.map((c, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  className="border rounded p-2 flex-1"
                  value={c.field}
                  onChange={(e) => updateSort(i, e.target.value)}
                >
                  <option value="usage_count">Nombre de fois réalisée</option>
                  <option value="note">Note</option>
                </select>

                <select
                  className="border rounded p-2"
                  value={c.order}
                  onChange={(e) => updateOrder(i, e.target.value)}
                >
                  <option value="desc">Décroissant</option>
                  <option value="asc">Croissant</option>
                </select>

                {sortCriteria.length > 0 && (
                  <button
                    className="text-red-500 font-bold"
                    onClick={() => removeSortCriterion(i)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            className="mt-2 px-3 py-1 bg-gray-200 rounded text-sm"
            onClick={addSortCriterion}
          >
            Ajouter un critère
          </button>
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

      </div>
    </div>
  );
}
