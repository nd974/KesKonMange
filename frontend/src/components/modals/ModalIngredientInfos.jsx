import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import ModalWrapper from "./ModalWrapper";

// Les unités avec leurs IDs directement
const UNITS = [
  { id: 13, label: "/kg - /L" },
];

export default function ModalIngredientInfos({ ingredientId, homeId, profileId, onClose }) {

  const [ingredient, setIngredient] = useState(null);
  const [shops, setShops] = useState([]);
  const [prices, setPrices] = useState({});

  // 🔹 Chargement de l'ingrédient
  useEffect(() => {
    if (!ingredientId) return;

    fetch(`${API_URL}/ingredient/get-all`)
      .then(res => res.json())
      .then(data => {
        const ing = data.find(i => i.id === Number(ingredientId));
        setIngredient(ing);
      });

    fetch(`${API_URL}/shops/get-all/${homeId}`)
      .then(res => res.json())
      .then(setShops);
  }, [ingredientId, homeId]);

  // 🔹 Charger les prix existants
  useEffect(() => {
    if (!homeId || !ingredientId) return;

    fetch(`${API_URL}/ingredient/get-price/${homeId}`)
      .then(res => res.json())
      .then(data => {
        const initialPrices = {};
        data.forEach(item => {
          if (item.ing_id === Number(ingredientId)) {
            const key = `${item.ing_id}-${item.shop_id}`;
            initialPrices[key] = {
              price: item.price,
              unit_id: item.unit_id
            };
          }
        });
        setPrices(initialPrices);
      });
  }, [homeId, ingredientId]);

  // 🔹 Changement de prix
  const handlePriceChange = (shopId, value) => {
    const key = `${ingredientId}-${shopId}`;
    setPrices(prev => ({
      ...prev,
      [key]: {
        price: value,
        unit_id: prev[key]?.unit_id || UNITS[0].id
      }
    }));
  };

  // 🔹 Changement d’unité
  const handleUnitChange = (shopId, unit_id) => {
    const key = `${ingredientId}-${shopId}`;
    setPrices(prev => ({
      ...prev,
      [key]: {
        price: prev[key]?.price || "",
        unit_id
      }
    }));
  };

  // 🔹 Enregistrer les prix pour cet ingrédient
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
      onClose?.();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement ❌");
    }
  };

  if (!ingredient) return null;

  return (
    <ModalWrapper onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">{ingredient.name}</h2>

      {shops.length === 0 ? (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded mb-4">
          Aucun shop enregistré trouvé pour cette maison.
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {shops.map(shop => {
            const key = `${ingredientId}-${shop.id}`;
            const current = prices[key] || {};

            return (
              <div key={shop.id} className="flex items-center gap-2">
                <span className="w-32">{shop.shop_name}</span>

                <div className="relative w-32">
                  <input
                    type="number"
                    step="0.01"
                    className="border rounded px-2 py-1 pr-7 w-full"
                    placeholder="Prix"
                    value={current.price ?? ""}
                    onChange={e => handlePriceChange(shop.id, e.target.value)}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-700">€</span>
                </div>

                <select
                  className="border rounded px-2 py-1 ml-2"
                  value={current.unit_id ?? UNITS[0].id}
                  onChange={e => handleUnitChange(shop.id, Number(e.target.value))}
                >
                  {UNITS.map(u => (
                    <option key={u.id} value={u.id}>{u.label}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={savePrices}
        className="bg-accentGreen text-white px-4 py-2 rounded-xl w-full"
      >
        Enregistrer
      </button>
    </ModalWrapper>
  );
}
