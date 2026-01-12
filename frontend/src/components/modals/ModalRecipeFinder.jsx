import { useState } from "react";

export default function ModalRecipeFinder({
  onClose,
  onApply,
  ingredients: initialIngredients = [],
  sortCriteria: initialSortCriteria = [],
}) {
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState(initialIngredients);

  // ⚡ Tous les critères disponibles
  const availableCriteria = [
    { field: "shop_count", label: "Nombre de magasins a faire⏳", order:"asc"},
    { field: "usage_count", label: "Nombre de fois réalisée" , order:"asc"},
    { field: "note", label: "Note personnelle"},
    { field: "note_general", label: "Note general⏳"},
    { field: "cheaper", label: "Prix des Ingredients manquants⏳", order:"asc"},
    { field: "price", label: "Prix total (bucket 5€)⏳", order:"asc"},
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recherche avancée</h2>
          <button onClick={onClose} className="text-xl text-gray-500">✕</button>
        </div>

        {/* INGREDIENTS */}
        <div className="mb-5">
          <label className="font-semibold block mb-1">Ingrédients dans la recette</label>

          <div className="flex gap-2">
            <input
              className="flex-1 border rounded p-2"
              placeholder="Ex : pomme de terre"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addIngredient()}
            />
            <button onClick={addIngredient} className="px-3 bg-green-600 text-white rounded">
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
      </div>
    </div>
  );
}
