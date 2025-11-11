import { useState } from "react";

export default function IngredientsAdd() {
  const [ingredients, setIngredients] = useState([
    { quantity: "", unit: "", name: "" },
  ]);

  const handleChange = (index, field, value) => {
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

  return (
    <div className="ingredients-section p-4 bg-gray-50 rounded-2xl shadow-sm">
      <h3 className="font-bold text-lg mb-3">🥕 Ingrédients nécessaires</h3>

      <div className="space-y-2">
        {ingredients.map((ing, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm"
          >
            <input
              type="number"
              placeholder="Quantité"
              value={ing.quantity}
              onChange={(e) => handleChange(index, "quantity", e.target.value)}
              className="w-20 border border-gray-300 rounded-md px-2 py-1"
            />
            <input
              type="text"
              placeholder="Unité (g, ml, kg...)"
              value={ing.unit}
              onChange={(e) => handleChange(index, "unit", e.target.value)}
              className="w-28 border border-gray-300 rounded-md px-2 py-1"
            />
            <input
              type="text"
              placeholder="Ingrédient"
              value={ing.name}
              onChange={(e) => handleChange(index, "name", e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-2 py-1"
            />
            <button
              onClick={() => removeIngredient(index)}
              className="text-red-500 hover:text-red-700 text-xl font-bold"
              title="Supprimer"
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addIngredient}
        className="mt-3 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
      >
        ➕ Ajouter un ingrédient
      </button>
    </div>
  );
}
