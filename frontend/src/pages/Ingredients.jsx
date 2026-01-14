import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Les unités avec leurs IDs directement
const UNITS = [
  { id: 13, label: "kg-L" },
  { id: 20, label: "pièce" },
  { id: 21, label: "tranche" },
  { id: 23, label: "tête" }
];

export default function Ingredients({ homeId, profileId }) {

  const ShopLink = () => (
    <a href="/shops" className="text-green-600 underline hover:text-green-800">
      Magasins
    </a>
  );

  const [ingredients, setIngredients] = useState([]);
  const [shops, setShops] = useState([]);
  const [prices, setPrices] = useState({});
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");

  const targetIngredientId = searchParams.get("ingredient");
  const ingredientRefs = useRef({});

  // 🔹 Chargement des ingrédients et shops
  useEffect(() => {
    if (!homeId) return;

    fetch(`${API_URL}/ingredient/get-all`)
      .then(res => res.json())
      .then(setIngredients);

    fetch(`${API_URL}/shops/get-all/${homeId}`)
      .then(res => res.json())
      .then(setShops);
  }, [homeId]);

  // 🔹 Charger les prix existants pour chaque shop-ingredient
  useEffect(() => {
    if (!homeId) return;
    fetch(`${API_URL}/ingredient/get-price/${homeId}`)
      .then(res => res.json())
      .then(data => {
        // data = [{ ing_id, shop_id, price, unit_id }, ...]
        const initialPrices = {};
        data.forEach(item => {
          const key = `${item.ing_id}-${item.shop_id}`;
          initialPrices[key] = {
            price: item.price,
            unit_id: item.unit_id
          };
        });
        setPrices(initialPrices);
      });
  }, [homeId]);

  // 🔹 Scroll vers l’ingrédient ciblé
  // useEffect(() => {
  //   if (targetIngredientId && ingredientRefs.current[targetIngredientId]) {
  //     ingredientRefs.current[targetIngredientId].scrollIntoView({
  //       behavior: "smooth",
  //       block: "center"
  //     });
  //   }
  // }, [targetIngredientId, ingredients]);

  // 🔹 Gestion du changement de prix
  const handlePriceChange = (ingredientId, shopId, value) => {
    const key = `${ingredientId}-${shopId}`;
    setPrices(prev => ({
      ...prev,
      [key]: {
        price: value,
        unit_id: prev[key]?.unit_id || UNITS[0].id
      }
    }));
  };

  // 🔹 Gestion du changement d’unité
  const handleUnitChange = (ingredientId, shopId, unit_id) => {
    const key = `${ingredientId}-${shopId}`;
    setPrices(prev => ({
      ...prev,
      [key]: {
        price: prev[key]?.price || "",
        unit_id
      }
    }));
  };

  // 🔹 Enregistrer les prix en base
  const savePrices = async () => {
    const payload = Object.entries(prices)
      .map(([key, value]) => {
        const [ing_id, shop_id] = key.split("-");
        if (!value.price) return null;
        return {
          ing_id: Number(ing_id),
          shop_id: Number(shop_id),
          price: Number(value.price),
          unit_id: value.unit_id
        };
      })
      .filter(Boolean);

    if (payload.length === 0) {
      alert("Aucun prix à enregistrer");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/ingredient/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erreur serveur");
      alert("Prix enregistrés ✅");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement ❌");
    }
  };

  // 🔹 Filtrage des ingrédients
  const filteredIngredients = targetIngredientId
    ? ingredients.filter(i => String(i.id) === targetIngredientId && i.recipe_id == null)
    : ingredients
        .filter(i => i.recipe_id == null) // <-- Exclure les ingrédients avec rec_id non null
        .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
<div className="p-6 max-w-4xl mx-auto">
  <h1 className="text-2xl font-bold mb-4">
    {targetIngredientId
      ? `${filteredIngredients[0]?.name ?? ""}`
      : "Ingrédients"}
  </h1>

  {/* Barre de recherche */}
  {!targetIngredientId && (
    <input
      type="text"
      placeholder="Rechercher un ingrédient..."
      className="border rounded px-3 py-2 w-full mb-4"
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
    />
  )}

  <button
    onClick={savePrices}
    className="mb-6 bg-accentGreen text-white px-4 py-2 rounded-xl"
  >
    Enregistrer les prix
  </button>

  {/* Si aucun shop */}
  {shops.length === 0 ? (
    <div className="p-4 bg-softBeige text-yellow-800 rounded">
      Aucun shop trouvé pour ce home. Veuillez ajouter un shop dans <ShopLink />
    </div>
  ) : (
    <div className="space-y-6">
      {filteredIngredients.map(ingredient => {
        const isTarget = String(ingredient.id) === targetIngredientId;

        return (
          <div
            key={ingredient.id}
            ref={el => (ingredientRefs.current[ingredient.id] = el)}
            className={`p-4 rounded-xl border transition ${
              isTarget ? "border-black bg-gray-100" : "border-gray-200"
            }`}
          >
            <h2 className="font-semibold mb-3">{targetIngredientId ? "Magasin(s)" : ingredient.name}</h2>

            <div className="space-y-2">
              {shops.map(shop => {
                const key = `${ingredient.id}-${shop.id}`;
                const current = prices[key] || {};

                return (
                  <div key={shop.id} className="flex items-center gap-2">
                    <span className="w-32">{shop.shop_name}</span>

                    <div className="relative w-32">
                      <input
                        type="number"
                        step="0.01"
                        className="border rounded px-2 py-1 pr-7 w-full" // pr-7 pour laisser de la place au €
                        placeholder="Prix"
                        value={current.price ?? ""}
                        onChange={e =>
                          handlePriceChange(
                            ingredient.id,
                            shop.id,
                            e.target.value
                          )
                        }
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-700">€</span>
                    </div>

                    {/* Sélecteur unité avec espace */}
                    <select
                      className="border rounded px-2 py-1 ml-2"
                      value={current.unit_id ?? UNITS[0].id}
                      onChange={e =>
                        handleUnitChange(
                          ingredient.id,
                          shop.id,
                          Number(e.target.value)
                        )
                      }
                    >
                      {UNITS.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.label}
                        </option>
                      ))}
                    </select>

                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>

  );
}
