import { useState, useEffect } from "react";
import Header from "../components/Header";
import HomeZone from "../components/HomeZone";

const id_istanceDBid = 87+4;

const ingredients = [
  { id: 1, name: "Tomates", quantity: 2, unit: "kg", instanceId: id_istanceDBid, expiration: "2026-12-05" },
  { id: 2, name: "Lait", quantity: 1, unit: "L", instanceId: id_istanceDBid, expiration: "2025-12-05" },
  { id: 3, name: "Beurre", quantity: 0.5, unit: "kg", instanceId: id_istanceDBid, expiration: "2025-06-01" },

  { id: 4, name: "Jambon", quantity: 4, unit: "tranches", instanceId: id_istanceDBid+1, expiration: "2025-02-10" },
  { id: 5, name: "Oeufs", quantity: 12, unit: "pcs", instanceId: id_istanceDBid+1, expiration: "2025-03-05" },

  { id: 6, name: "Poulet", quantity: 1.5, unit: "kg", instanceId: id_istanceDBid+2, expiration: "2025-02-02" },
  { id: 7, name: "Glace Vanille", quantity: 1, unit: "L", instanceId: id_istanceDBid+2, expiration: "2026-01-01" },
  { id: 8, name: "Haricots Surgelés", quantity: 0.8, unit: "kg", instanceId: id_istanceDBid+2, expiration: "2027-01-10" },

  { id: 9, name: "Farine", quantity: 5, unit: "kg", instanceId: id_istanceDBid+3, expiration: "2026-12-10" },
  { id: 10, name: "Pâtes", quantity: 3, unit: "kg", instanceId: id_istanceDBid+3, expiration: "2027-05-21" },
  { id: 11, name: "Riz", quantity: 2, unit: "kg", instanceId: id_istanceDBid+3, expiration: "2027-09-01" },
];

export default function Stock({ homeId }) {
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const nb_day_postmeal = 7;
  const today = new Date();

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
  // ✅ Ici, on utilise instanceId = storage.id
const displayedIngredients = selectedStorage
  ? sortIngredients(
      ingredients
        .filter(i => i.instanceId === selectedStorage.id)
        .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
        .filter(i => (unitFilter ? i.unit === unitFilter : true))
    )
  : [];

// ✅ Ici, on veut tous les ingredients qui existe mais qui ont pqs de storqges lie a leutr instanceId
const displayedIngredientsNull = selectedStorage
  ? sortIngredients(
      ingredients
        .filter(i => i.instanceId === null)
        .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
        .filter(i => (unitFilter ? i.unit === unitFilter : true))
    )
  : []; // A REFAIRE et le faire affiché uniquement si aucun stotrageest selectionne (donc quoand on arrive sur la page et que c'est l'affichage par dafaut)



  const units = [...new Set(ingredients.map(i => i.unit))];

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
              console.log("Storage sélectionné", storage.id); // ✅ lire le paramètre
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
                      onClick={() => handleSort("name")}
                    >
                      Nom {sortColumn === "name" && (sortOrder === "asc" ? " ▲" : " ▼")}
                    </th>
                    <th className="border px-2 py-1">Quantité</th>
                    <th className="border px-2 py-1">Unité</th>
                    <th
                      className="border px-2 py-1 cursor-pointer select-none"
                      onClick={() => handleSort("expiration")}
                    >
                      Péremption {sortColumn === "expiration" && (sortOrder === "asc" ? " ▲" : " ▼")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedIngredients.length > 0 ? (
                    displayedIngredients.map((ing, idx) => {
                      const status = getExpirationStatus(ing.expiration);
                      return (
                        <tr key={idx}>
                          <td className="border px-2 py-1">{ing.name}</td>
                          <td className="border px-2 py-1">{ing.quantity}</td>
                          <td className="border px-2 py-1">{ing.unit}</td>
                          <td className={`border px-2 py-1
                            ${status === "expired" ? "text-red-600 font-semibold" : ""}
                            ${status === "soon" ? "text-orange-500 font-semibold" : ""}`}
                          >
                            {ing.expiration}
                            {status === "expired" && <span className="ml-2 text-red-600">⚠️ Expiré</span>}
                            {status === "soon" && <span className="ml-2 text-orange-500">⏳ Bientôt</span>}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="border px-2 py-2 text-center" colSpan="4">
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
