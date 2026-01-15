import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
import { CLOUDINARY_RES } from "../../config/constants";
import { toast } from "react-hot-toast";


export default function UnusedIngredients() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUnused = async () => {
    const res = await fetch(`${API_URL}/ingredient/get-unused`);
    const data = await res.json();
    setIngredients(data);
    setLoading(false);
  };

  const deleteIngredient = async (id) => {
    if (!confirm("Supprimer cet ingrédient ?")) return;

    await fetch(`${API_URL}/ingredient/${id}`, {
      method: "DELETE",
    });

    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  useEffect(() => {
    fetchUnused();
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">
        Ingrédients non utilisés
      </h1>

      {ingredients.length === 0 && (
        <p>Aucun ingrédient inutilisé 🎉</p>
      )}

      <ul className="space-y-2">
        {ingredients.map((ingredient) => (
          <li
            key={ingredient.id}
            className="flex items-center justify-between border p-3 rounded"
          >
            <div className="flex items-center gap-4">
              {ingredient.picture && (
                <img
                src={`${CLOUDINARY_RES}${ingredient.picture}`}
                alt={ingredient.name}
                className="w-12 h-12 object-cover rounded"
                onClick={() => {
                    navigator.clipboard.writeText(CLOUDINARY_RES+ingredient.picture);
                    toast.success("URL copiée", {
                        style: {
                            marginTop: "50vh",
                        },
                    });
                }}
                />
              )}

              <span>{ingredient.name}</span>
            </div>

            <button
              onClick={() => deleteIngredient(ingredient.id)}
              className="text-red-600 hover:underline"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
