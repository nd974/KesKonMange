import { useState, useEffect } from "react";
import Header from "../components/Header";
import HomeZone from "../components/HomeZone";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Stock({ homeId }) {
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [ingredients, setIngredients] = useState([]); // Stocke les ingrédients récupérés
  const [loading, setLoading] = useState(true); // Indicateur de chargement
  const nb_day_postmeal = 7;
  const today = new Date();
  console.log("Récupération2 des ingrédients pour le homeId:", homeId);
  // Fonction pour récupérer les produits pour un homeId spécifique
  useEffect(() => {
    console.log("Récupération des ingrédients pour le homeId:", homeId);
    const fetchIngredients = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/product/getProducts/${homeId}`);
        console.log(response);
        const data = await response.json();
        setIngredients(data); // Mise à jour des ingrédients avec les données récupérées
      } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, [homeId]);

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR"); // Format français sans heures, minutes et secondes
  }

  function getExpirationStatus(dateStr) {
    const date = new Date(dateStr);
    const diff = (date - today) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "expired";
    if (diff <= nb_day_postmeal) return "soon";
    return "ok";
  }


  function sortIngredients(list) {
    if (!sortColumn) return list;
    return [...list].sort((a, b) => {
      let v1 = a[sortColumn];
      let v2 = b[sortColumn];
      if (sortColumn === "expiration") {
        v1 = new Date(v1);
        v2 = new Date(v2);
      }
      if (v1 < v2) return sortOrder === "asc" ? -1 : 1;
      if (v1 > v2) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  function handleSort(column) {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  }

  const displayedIngredients = selectedStorage
    ? sortIngredients(
        ingredients
          .filter(i => i.stock_id === selectedStorage.id)
          .filter(i => i.ingredient_name.toLowerCase().includes(search.toLowerCase()))
          .filter(i => (unitFilter ? i.unit_name === unitFilter : true))
      )
    : [];

  const displayedIngredientsNull = selectedStorage
    ? sortIngredients(
        ingredients
          .filter(i => i.stock_id === null)
          .filter(i => i.ingredient_name.toLowerCase().includes(search.toLowerCase()))
          .filter(i => (unitFilter ? i.unit_name === unitFilter : true))
      )
    : [];

  const units = [...new Set(ingredients.map(i => i.unit_name))];

  async function deleteProduct(id) {
    const ok = confirm("Supprimer ce produit ?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/product/delete/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (data.ok) {
        setIngredients((prev) => prev.filter(p => p.id !== id));
      } else {
        alert("Erreur : " + data.error);
      }

    } catch (e) {
      console.error(e);
      alert("Erreur réseau");
    }
  }


  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8">
      <Header homeId={homeId} />

      <div className="flex flex-col lg:flex-row gap-6 py-8">
        <div className="w-full lg:w-1/3">
          <HomeZone
            key={homeId}
            homeId={homeId}
            onSelectStorage={(storage) => {
              if (!storage) return;
              console.log("Storage sélectionné", storage);
              setSelectedStorage(storage);
            }}
            onSelectZone={() => setSelectedStorage(null)}
          />
        </div>

        <div className="w-full lg:w-2/3">
          {selectedStorage && (
            <>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex flex-col w-full md:w-1/2">
                  <h2 className="text-xl font-semibold mb-2 pb-5">
                    {`Ingrédients dans ${selectedStorage.displayName || selectedStorage.name}`}
                  </h2>
                  <label>Recherche</label>
                  <input
                    type="text"
                    className="border px-3 py-1 rounded"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nom d’ingrédient"
                  />
                </div>

                <div className="flex flex-col w-full md:w-1/2">
                  <label>Unité</label>
                  <select
                    className="border px-3 py-1 rounded"
                    value={unitFilter}
                    onChange={(e) => setUnitFilter(e.target.value)}
                  >
                    <option value="">Toutes</option>
                    {units.map((u, i) => (
                      <option key={i} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

<table className="w-full border mt-2">
  <thead className="bg-gray-200">
    <tr>
      <th
        className="border px-2 py-1 cursor-pointer select-none"
        onClick={() => handleSort("ingredient_name")}
      >
        Nom {sortColumn === "ingredient_name" && (sortOrder === "asc" ? " ▲" : " ▼")}
      </th>
      <th className="border px-2 py-1">Quantité</th>
      <th className="border px-2 py-1">Unité</th>
      <th
        className="border px-2 py-1 cursor-pointer select-none"
        onClick={() => handleSort("expiry")}
      >
        Péremption {sortColumn === "expiry" && (sortOrder === "asc" ? " ▲" : " ▼")}
      </th>

      {/* 👉 Nouvelle colonne Action */}
      <th className="border px-2 py-1">Action</th>
    </tr>
  </thead>

  <tbody>
    {loading ? (
      <tr>
        <td className="border px-2 py-2 text-center" colSpan="5">
          Chargement...
        </td>
      </tr>
    ) : displayedIngredients.length > 0 ? (
      displayedIngredients.map((ing, idx) => {
        const status = getExpirationStatus(ing.expiry);
        return (
          <tr key={idx}>
            <td className="border px-2 py-1">{ing.ingredient_name}</td>
            <td className="border px-2 py-1">{ing.amount}</td>
            <td className="border px-2 py-1">{ing.unit_name}</td>

            <td
              className={`border px-2 py-1
                ${status === "expired" ? "text-red-600 font-semibold" : ""}
                ${status === "soon" ? "text-orange-500 font-semibold" : ""}`}
            >
              {formatDate(ing.expiry)}
              {status === "expired" && (
                <span className="ml-2 text-red-600">⚠️ Expiré</span>
              )}
              {status === "soon" && (
                <span className="ml-2 text-orange-500">⏳ Bientôt</span>
              )}
            </td>

            {/* 👉 Colonne Action */}
            <td className="border px-2 py-1 text-center space-x-3">
              <div className="flex items-center justify-center space-x-3">
                <button
                  className="text-blue-600 hover:text-blue-800"
                  title="Modifier"
                >
                  ✏️
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                  title="Supprimer"
                  onClick={() => deleteProduct(ing.id)}
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        );
      })
    ) : (
      <tr>
        <td className="border px-2 py-2 text-center" colSpan="5">
          Aucun ingrédient
        </td>
      </tr>
    )}
  </tbody>
</table>


            </>
          )}
        </div>
      </div>
    </div>
  );
}
