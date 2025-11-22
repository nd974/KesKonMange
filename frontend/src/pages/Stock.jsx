import { useState } from "react";
import Header from "../components/Header";
import HomeZone from "../components/HomeZone";

const initialStorages = [
  { id: 1, name: "Frigo", x: 10, y: 10, w: 120, h: 120 },
  { id: 2, name: "Congélateur", x: 150, y: 10, w: 120, h: 120 },
  { id: 3, name: "Placard", x: 10, y: 150, w: 120, h: 120 },
];

const ingredients = [
  { name: "Tomates", quantity: 2, unit: "kg", storage_id: 1 },
  { name: "Lait", quantity: 1, unit: "L", storage_id: 1 },
  { name: "Poulet", quantity: 1.5, unit: "kg", storage_id: 2 },
  { name: "Farine", quantity: 5, unit: "kg", storage_id: 3 },
];

export default function Stock({ homeId }) {
  const [storages] = useState(initialStorages);
  const [selectedStorage, setSelectedStorage] = useState(null);

  const displayedIngredients = selectedStorage
    ? ingredients.filter(i => i.storage_id === selectedStorage.id)
    : [];

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8 flex flex-col gap-4">
      <Header homeId={homeId} />
      <h1 className="text-2xl font-bold mb-4 text-center">Stockages d’ingrédients Version 1</h1>

      <svg viewBox="0 0 600 600" className="w-full h-[500px] border">
        {storages.map((storage) => (
          <g
            key={storage.id}
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedStorage(storage)}
          >
            <rect
              x={storage.x}
              y={storage.y}
              width={storage.w}
              height={storage.h}
              fill="#60A5FA"
              stroke="#111827"
              strokeWidth="2"
            />
            <text
              x={storage.x + storage.w / 2}
              y={storage.y + storage.h / 2 + 5}
              textAnchor="middle"
              fontSize="12"
              fill="#111827"
            >
              {storage.name}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">
          {selectedStorage ? `Ingrédients dans ${selectedStorage.name}` : "Sélectionnez un stockage"}
        </h2>
        <ul className="list-disc list-inside">
          {displayedIngredients.length > 0
            ? displayedIngredients.map((ing, idx) => (
                <li key={idx}>{ing.name} - {ing.quantity} {ing.unit}</li>
              ))
            : selectedStorage && <li>Aucun ingrédient</li>}
        </ul>
      </div>

      <HomeZone ingredients={ingredients} />
    </div>
  );
}


