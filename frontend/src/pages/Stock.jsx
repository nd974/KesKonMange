import { useState } from "react";
import Header from "../components/Header";
import HomeZone from "../components/HomeZone";

const initialStorages = [
  { id: 1, name: "Frigo Haut" },
  { id: 2, name: "Frigo Bas" },
  { id: 3, name: "Congélateur" },
  { id: 4, name: "Placard Sec 1" },
  { id: 5, name: "Placard Sec 2" },
  { id: 6, name: "Étagère Cuisine" },
  { id: 7, name: "Cave" },
  { id: 8, name: "a" },
  { id: 9, name: "z" },
  { id: 10, name: "e" },
  { id: 11, name: "r" },
  { id: 12, name: "t" },
  { id: 13, name: "y" },
  { id: 14, name: "u" },
  { id: 15, name: "i" },
  { id: 16, name: "o" }
];

const ingredients = [
  { name: "Tomates", quantity: 2, unit: "kg", storage_id: 1, expiration: "2026-12-05" },
  { name: "Lait", quantity: 1, unit: "L", storage_id: 1, expiration: "2025-12-05" },
  { name: "Beurre", quantity: 0.5, unit: "kg", storage_id: 1, expiration: "2025-06-01" },

  { name: "Jambon", quantity: 4, unit: "tranches", storage_id: 2, expiration: "2025-02-10" },
  { name: "Oeufs", quantity: 12, unit: "pcs", storage_id: 2, expiration: "2025-03-05" },

  { name: "Poulet", quantity: 1.5, unit: "kg", storage_id: 3, expiration: "2025-02-02" },
  { name: "Glace Vanille", quantity: 1, unit: "L", storage_id: 3, expiration: "2026-01-01" },
  { name: "Haricots Surgelés", quantity: 0.8, unit: "kg", storage_id: 3, expiration: "2027-01-10" },

  { name: "Farine", quantity: 5, unit: "kg", storage_id: 4, expiration: "2026-12-10" },
  { name: "Pâtes", quantity: 3, unit: "kg", storage_id: 4, expiration: "2027-05-21" },
  { name: "Riz", quantity: 2, unit: "kg", storage_id: 4, expiration: "2027-09-01" },

  { name: "Conserves Tomates", quantity: 6, unit: "pcs", storage_id: 5, expiration: "2030-01-01" },
  { name: "Thon Boîtes", quantity: 4, unit: "pcs", storage_id: 5, expiration: "2031-01-01" },
  { name: "Sucre", quantity: 1, unit: "kg", storage_id: 5, expiration: "2035-01-01" },

  { name: "Épices", quantity: 10, unit: "pots", storage_id: 6, expiration: "2030-06-10" },
  { name: "Huile d’Olive", quantity: 2, unit: "L", storage_id: 6, expiration: "2027-01-01" },
  { name: "Céréales", quantity: 1, unit: "kg", storage_id: 6, expiration: "2025-04-10" },

  { name: "Vin Rouge", quantity: 3, unit: "bouteilles", storage_id: 7, expiration: "2040-01-01" },
  { name: "Pommes de Terre", quantity: 10, unit: "kg", storage_id: 7, expiration: "2025-03-08" },
  { name: "Oignons", quantity: 2, unit: "kg", storage_id: 7, expiration: "2025-02-25" },

  { name: "Eau", quantity: 12, unit: "bouteilles", storage_id: 8, expiration: "2033-10-01" },
  { name: "Sodas", quantity: 6, unit: "bouteilles", storage_id: 8, expiration: "2026-05-05" },
  { name: "Confiture", quantity: 3, unit: "pots", storage_id: 8, expiration: "2026-06-12" },
];

export default function Stock({ homeId }) {

  const [storages] = useState(initialStorages);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("");

  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const columns = 4;
  const cellSize = 130;
  const gap = 20;
  const padding = 20;
  const nb_day_postmeal = 7;

  const totalWidth = columns * (cellSize + gap);
  const totalHeight = Math.ceil(storages.length / columns) * (cellSize + gap);

  function getAutoLayoutPosition(index) {
    const row = Math.floor(index / columns);
    const col = index % columns;

    const x = padding + col * (cellSize + gap);
    const y = padding + row * (cellSize + gap);

    return { x, y, w: cellSize, h: cellSize };
  }

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

  const displayedIngredients = selectedStorage
    ? sortIngredients(
        ingredients
          .filter(i => i.storage_id === selectedStorage.id)
          .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
          .filter(i => (unitFilter ? i.unit === unitFilter : true))
      )
    : [];

  const units = [...new Set(ingredients.map(i => i.unit))];

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8">

      <Header homeId={homeId} />

      <div className="flex flex-col lg:flex-row gap-6 py-8">

        {/* SVG : 1/3 sur desktop, full width mobile */}
        <div className="w-full lg:w-1/3">
          <svg
            viewBox={`0 0 ${totalWidth + padding * 2} ${totalHeight + padding * 2}`}
            className="border w-full h-[500px]"
          >
            {storages.map((storage, index) => {
              const { x, y, w, h } = getAutoLayoutPosition(index);

              return (
                <g
                  key={storage.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedStorage(storage)}
                >
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill="#60A5FA"
                    stroke="#111827"
                    strokeWidth="2"
                  />
                  <text
                    x={x + w / 2}
                    y={y + h / 2 + 5}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#111827"
                  >
                    {storage.name}
                  </text>
                </g>
              );
            })}
          </svg>
          <HomeZone ingredients={ingredients} />
        </div>

        {/* TABLEAU : 2/3 sur desktop, full width mobile */}
        <div className="w-full lg:w-2/3">

          {selectedStorage && (
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex flex-col w-full md:w-1/2">
                <h2 className="text-xl font-semibold mb-2 pb-5">
                  {selectedStorage ? `Ingrédients dans ${selectedStorage.name}` : "Sélectionnez un stockage"}
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
          )}

          <div className="">

            {selectedStorage && (
              <table className="w-full border mt-2">
                <thead className="bg-gray-200">
                  <tr>
                    <th
                      className="border px-2 py-1 cursor-pointer select-none"
                      onClick={() => handleSort("name")}
                    >
                      Nom
                      {sortColumn === "name" && (sortOrder === "asc" ? " ▲" : " ▼")}
                    </th>

                    <th className="border px-2 py-1">Quantité</th>

                    <th className="border px-2 py-1">Unité</th>

                    <th
                      className="border px-2 py-1 cursor-pointer select-none"
                      onClick={() => handleSort("expiration")}
                    >
                      Péremption
                      {sortColumn === "expiration" && (sortOrder === "asc" ? " ▲" : " ▼")}
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

                          <td
                            className={`border px-2 py-1
                              ${status === "expired" ? "text-red-600 font-semibold" : ""}
                              ${status === "soon" ? "text-orange-500 font-semibold" : ""}
                            `}
                          >
                            {ing.expiration}

                            {status === "expired" && (
                              <span className="ml-2 text-red-600">⚠️ Expiré</span>
                            )}

                            {status === "soon" && (
                              <span className="ml-2 text-orange-500">⏳ Bientôt</span>
                            )}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
