import { useState, useEffect } from "react";
import Draggable from "react-draggable";

export default function HomeZone({ ingredients }) {
  const [zones, setZones] = useState([]);
  const [storages, setStorages] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [displayedIngredients, setDisplayedIngredients] = useState([]);
  const [dragOverZone, setDragOverZone] = useState(null);

  const [showZoneModal, setShowZoneModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("1x1");
  const [selectedZoneName, setSelectedZoneName] = useState("Cuisine");

  const [showStorageModal, setShowStorageModal] = useState(false);
  const [selectedStorageType, setSelectedStorageType] = useState("Frigo");
  const [selectedStorageSize, setSelectedStorageSize] = useState("1x1");

  const unitPx = 120;
  const gridSize = 5; // 5x5 unités max
  const zoneNames = ["Cuisine", "Salon", "Chambre", "Entrée", "Bureau"];
  const storageTypes = ["Frigo", "Congélateur", "Placard", "Cave à vin", "Rangement sec"];

  const generateId = () => Math.floor(Math.random() * 100000);

  const storageSizes = [];
  for (let w = 1; w <= 3; w++) {
    for (let h = 1; h <= 3; h++) {
      storageSizes.push(`${w}x${h}`);
    }
  }

  useEffect(() => {
    if (selectedStorage && !selectedStorage.isZone) {
      const filtered = ingredients.filter(
        (i) => i.storage_id === selectedStorage.id
      );
      setDisplayedIngredients(filtered);
    } else {
      setDisplayedIngredients([]);
    }
  }, [selectedStorage, ingredients]);

  const computeZonePositions = (zones) => {
    const grid = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(null)
    );
    const positions = [];

    for (let z of zones) {
      let placed = false;
      for (let y = 0; y <= gridSize - z.hUnits; y++) {
        for (let x = 0; x <= gridSize - z.wUnits; x++) {
          let free = true;
          for (let dy = 0; dy < z.hUnits; dy++) {
            for (let dx = 0; dx < z.wUnits; dx++) {
              if (grid[y + dy][x + dx] !== null) {
                free = false;
                break;
              }
            }
            if (!free) break;
          }
          if (free) {
            for (let dy = 0; dy < z.hUnits; dy++) {
              for (let dx = 0; dx < z.wUnits; dx++) {
                grid[y + dy][x + dx] = z.id;
              }
            }
            positions.push({
              ...z,
              x: x * unitPx + 10,
              y: y * unitPx + 10,
              w: z.wUnits * unitPx,
              h: z.hUnits * unitPx,
            });
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
      if (!placed) {
        alert(`Impossible de placer la zone "${z.name}" : espace insuffisant.`);
      }
    }

    return positions;
  };

  const zonePositions = computeZonePositions(zones);

  const updateParent = (child) => {
    const centerX = child.x + child.w / 2;
    const centerY = child.y + child.h / 2;

    const newParent = zonePositions.find(
      (zone) =>
        centerX >= zone.x &&
        centerX <= zone.x + zone.w &&
        centerY >= zone.y &&
        centerY <= zone.y + zone.h
    );

    if (!newParent) return false;

    setStorages((prev) =>
      prev.map((s) =>
        s.id === child.id ? { ...s, parent_id: newParent.id } : s
      )
    );
    return true;
  };

  const handleDrag = (e, data, child) => {
    const centerX = data.x + child.w / 2;
    const centerY = data.y + child.h / 2;
    const overZone = zonePositions.find(
      (zone) =>
        centerX >= zone.x &&
        centerX <= zone.x + zone.w &&
        centerY >= zone.y &&
        centerY <= zone.y + zone.h
    );
    setDragOverZone(overZone ? overZone.id : null);
  };

  const handleAddZone = () => {
    const [wUnits, hUnits] = selectedSize.split("x").map(Number);

    if (wUnits > 5 || hUnits > 5) {
      alert("La largeur et la hauteur d'une zone ne peuvent pas dépasser 5 unités.");
      return;
    }

    const totalUnits = zones.reduce((acc, z) => acc + z.wUnits * z.hUnits, 0);
    if (totalUnits + wUnits * hUnits > 25) {
      alert("Impossible d'ajouter cette zone : limite totale 25 unités dépassée.");
      return;
    }

    const newZone = {
      id: generateId(),
      name: selectedZoneName,
      wUnits,
      hUnits,
      color: "#FDE68A",
    };

    setZones([...zones, newZone]);
    setShowZoneModal(false);
  };

  const handleAddStorage = () => {
    const parentZone = zones[0]; // pour simplifier, on prend la première zone
    if (!parentZone) {
      alert("Ajoutez d'abord une zone.");
      return;
    }
    const countInZone = storages.filter(s => s.parent_id === parentZone.id).length;
    const [wUnits, hUnits] = selectedStorageSize.split("x").map(Number);
    const newStorage = {
      id: generateId(),
      name: selectedStorageType,
      parent_id: parentZone.id,
      x: 10,
      y: 10 + countInZone * 70,
      wUnits,
      hUnits,
      w: wUnits * 50,
      h: hUnits * 50,
    };
    setStorages([...storages, newStorage]);
    setShowStorageModal(false);
  };

  // Génération des tailles valides pour zones
  const sizes = [];
  const totalUnits = zones.reduce((acc, z) => acc + z.wUnits * z.hUnits, 0);
  for (let w = 1; w <= 5; w++) {
    for (let h = 1; h <= 5; h++) {
      if (w <= 5 && h <= 5 && totalUnits + w * h <= 25) sizes.push(`${w}x${h}`);
    }
  }

  return (
    <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Stockages d’ingrédients Version 2</h1>
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setShowZoneModal(true)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Ajouter une zone
        </button>
        <button
          onClick={() => setShowStorageModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Ajouter un stockage
        </button>
        <button
          onClick={() => {
            if (storages.length > 0) {
              setStorages(prev => prev.slice(0, -1));
            } else if (zones.length > 0) {
              setZones(prev => prev.slice(0, -1));
            } else {
              alert("Aucune zone ou stockage à supprimer");
            }
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Annuler dernier ajout
        </button>
      </div>

      {/* Popin ajout zone */}
      {showZoneModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-xl font-semibold mb-4">Nouvelle zone</h2>
            <label className="block mb-2 font-medium">Nom de la zone</label>
            <select
              value={selectedZoneName}
              onChange={(e) => setSelectedZoneName(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
            >
              {zoneNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <label className="block mb-2 font-medium">Taille</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
            >
              {sizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowZoneModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={handleAddZone}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popin ajout stockage */}
      {showStorageModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-xl font-semibold mb-4">Nouveau stockage</h2>
            <label className="block mb-2 font-medium">Type de stockage</label>
            <select
              value={selectedStorageType}
              onChange={(e) => setSelectedStorageType(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
            >
              {storageTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <label className="block mb-2 font-medium">Taille du stockage</label>
            <select
              value={selectedStorageSize}
              onChange={(e) => setSelectedStorageSize(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
            >
              {storageSizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowStorageModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={handleAddStorage}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SVG maison / zones / stockages */}
      <svg viewBox="0 0 600 600" className="w-full h-[500px] border">
        {zonePositions.map((zone) => (
          <g
            key={zone.id}
            style={{ cursor: "default" }}
            onClick={() => {
              const storagesInZone = storages.filter(s => s.parent_id === zone.id);
              setSelectedStorage({ id: zone.id, name: zone.name, isZone: true, storages: storagesInZone });
              setDisplayedIngredients([]);
            }}
          >
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.w-20}
              height={zone.h-20}
              fill={dragOverZone === zone.id ? "#FFD700" : zone.color}
              stroke="#111827"
              strokeWidth="2"
            />
            <text
              x={zone.x + zone.w / 2}
              y={zone.y + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#111827"
            >
              {zone.name}
            </text>
          </g>
        ))}

        {storages.map((child) => {
          const initialPos = { x: child.x, y: child.y };
          return (
            <Draggable
              key={child.id}
              position={{ x: child.x, y: child.y }}
              onDrag={(e, data) => handleDrag(e, data, child)}
              onStop={(e, data) => {
                const inZone = updateParent({ ...child, x: data.x, y: data.y });
                if (!inZone) {
                  setStorages(prev =>
                    prev.map(s => s.id === child.id ? { ...s, x: initialPos.x, y: initialPos.y } : s)
                  );
                } else {
                  setStorages(prev =>
                    prev.map(s => s.id === child.id ? { ...s, x: data.x, y: data.y } : s)
                  );
                }
                setDragOverZone(null);
              }}
            >
              <g style={{ cursor: "grab" }} onClick={() => setSelectedStorage(child)}>
                <rect x={0} y={0} width={child.w} height={child.h} fill="#60A5FA" stroke="#111827" strokeWidth="2" />
                <text x={child.w/2} y={child.h/2+5} textAnchor="middle" fontSize="10" fill="#111827">
                  {child.name}
                </text>
              </g>
            </Draggable>
          );
        })}
      </svg>

      {/* <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">
          {selectedStorage
            ? selectedStorage.isZone
              ? `Stockages dans ${selectedStorage.name}`
              : `Ingrédients dans ${selectedStorage.name}`
            : "Sélectionnez un stockage ou une zone"}
        </h2>
        <ul className="list-disc list-inside">
          {selectedStorage ? (
            selectedStorage.isZone
              ? (selectedStorage.storages.length > 0
                  ? selectedStorage.storages.map(s => <li key={s.id}>{s.name}</li>)
                  : <li>Aucun stockage</li>)
              : (displayedIngredients.length > 0
                  ? displayedIngredients.map((ing, idx) => <li key={idx}>{ing.name} - {ing.quantity} {ing.unit}</li>)
                  : <li>Aucun ingrédient</li>)
          ) : null}
        </ul>
      </div> */}
    </div>
  );
}
