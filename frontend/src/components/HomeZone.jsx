import { useState, useEffect } from "react";
import Draggable from "react-draggable";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


export default function HomeZone({ homeId }) {
  const [zones, setZones] = useState([]);
  const [storages, setStorages] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [dragOverZone, setDragOverZone] = useState(null);

  const [showZoneModal, setShowZoneModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("1x1");
  const [selectedZoneName, setSelectedZoneName] = useState("");

  const [showStorageModal, setShowStorageModal] = useState(false);
  const [selectedStorageType, setSelectedStorageType] = useState("");
  const [selectedStorageSize, setSelectedStorageSize] = useState("1x1");

  // ---------------------------
  //  ⚡ AJOUT : Données venant de la BDD
  // ---------------------------
  const [zoneNamesFromDB, setZoneNamesFromDB] = useState([]);
  const [storageTypesFromDB, setStorageTypesFromDB] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/storage/getAllZones`)
      .then((res) => res.json())
      .then((data) => {
        setZoneNamesFromDB(data);
        if (data.length > 0) setSelectedZoneName(data[0].name);
      });

    fetch(`${API_URL}/storage/getAllStorages`)
      .then((res) => res.json())
      .then((data) => {
        setStorageTypesFromDB(data);
        if (data.length > 0) setSelectedStorageType(data[0].name);
      });
  }, []);

  useEffect(() => {
    if (!homeId) return;

    fetch(`${API_URL}/storage/getSVG?homeId=${homeId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Loaded SVG", data);

        setZones(data.zones.map(z => ({
          id: z.id,
          name: z.name,
          wUnits: z.w_units,
          hUnits: z.h_units,
          x: z.x,
          y: z.y,
          color: z.color ?? "#FDE68A",
        })));

        setStorages(data.storages.map(s => ({
          id: s.id,              // id de la BDD
          name: s.name,
          parent_id: s.parent_id,
          x: s.x,
          y: s.y,
          wUnits: s.w_units,
          hUnits: s.h_units,
          w: s.w_units * 50,
          h: s.h_units * 50,
          color: s.color ?? "#60A5FA",
          localId: generateId(),  // <-- ajouter un id unique pour React
        })));
      })
      .catch(err => console.error("Erreur chargement SVG:", err));
}, [homeId]);


  // ---------------------------
  // CONSTANTES LOGIQUES
  // ---------------------------
  const unitPx = 120;
  const gridSize = 5;

  const generateId = () => Math.floor(Math.random() * 100000);

  // Génération tailles de stockages
  const storageSizes = [];
  for (let w = 1; w <= 3; w++) {
    for (let h = 1; h <= 3; h++) {
      storageSizes.push(`${w}x${h}`);
    }
  }

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
        s.localId === child.localId ? { ...s, parent_id: newParent.id } : s
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
    console.log("zones", zones);
    console.log("storages", storages);
  };

  // ---------------------------
  //  AJOUT ZONE
  // ---------------------------
  const handleAddZone = () => {
    const [wUnits, hUnits] = selectedSize.split("x").map(Number);

    const totalUnits = zones.reduce((acc, z) => acc + z.wUnits * z.hUnits, 0);
    if (totalUnits + wUnits * hUnits > 25) {
      alert("Impossible d'ajouter cette zone : limite totale dépassée.");
      return;
    }

    const newZone = {
      id: generateId(),
      name: selectedZoneName,
      wUnits,
      hUnits,
      x: 10,                       // ajout des coordonnées x
      y: 10 + zones.length * 70,   // empilement vertical simple
      color: "#FDE68A",
      w: wUnits * 50,               // largeur en pixels
      h: hUnits * 50,               // hauteur en pixels
    };

    setZones([...zones, newZone]);
    setShowZoneModal(false);
  };


  // ---------------------------
  //  AJOUT STOCKAGE
  // ---------------------------
  const handleAddStorage = () => {
    const parentZone = zones[0];
    if (!parentZone) return alert("Ajoutez une zone d'abord.");

    const countInZone = storages.filter(s => s.parent_id === parentZone.id).length;
    const [wUnits, hUnits] = selectedStorageSize.split("x").map(Number);

    const newStorage = {
      localId: generateId(),   // <-- identifiant unique pour React
      storageId: selectedStorageType.id, // ou s.id si tu veux garder le lien BDD
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

  // ---------------------------
  //  Annuler ZONE/STOCAKGE
  // ---------------------------
  const handleAnnul = () => {
    if (storages.length > 0) {
      setStorages(prev => prev.slice(0, -1));
    } 
    else if (zones.length > 0) {
      setZones(prev => prev.slice(0, -1));
    } 
    else {
      alert("Aucune zone ou stockage à supprimer");
    }
  };

  // ---------------------------
  //  Sauvegarder ZONE/STOCAKGE
  // ---------------------------
const handleSave = async () => {
  try {
    // On combine zones et stockages
    const allItems = [
      ...zones.map(z => ({
        name: z.name,      // doit exister dans Storage
        x: z.x,
        y: z.y,
        w_units: z.wUnits,
        h_units: z.hUnits,
        color: z.color ?? "#FDE68A"
      })),
      ...storages.map(s => ({
        name: s.name,      // doit exister dans Storage
        x: s.x,
        y: s.y,
        w_units: s.wUnits,
        h_units: s.hUnits,
        color: s.color ?? "#60A5FA"
      }))
    ];

    const response = await fetch(`${API_URL}/storage/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ home_id: homeId, items: allItems })
    });

    const data = await response.json();
    console.log("Save response:", data);

    if (response.ok) {
      alert("Plan sauvegardé avec succès !");
    } else {
      alert("Erreur lors de la sauvegarde : " + (data.details || data.error));
    }
  } catch (err) {
    console.error("Erreur fetch save:", err);
    alert("Erreur réseau lors de la sauvegarde");
  }
};







  // ---------------------------
  // Tailles zones disponibles
  // ---------------------------
  const sizes = [];
  const totalUnits = zones.reduce((acc, z) => acc + z.wUnits * z.hUnits, 0);
  for (let w = 1; w <= 5; w++) {
    for (let h = 1; h <= 5; h++) {
      if (totalUnits + w * h <= 25) sizes.push(`${w}x${h}`);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Stockages d’ingrédients (Version 2)
      </h1>

      {/* Boutons */}
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
          onClick={() => handleAnnul()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Annuler
        </button>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Sauvegarder
        </button>
      </div>

      {/* POPIN AJOUT ZONE */}
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
              {zoneNamesFromDB.map((zone) => (
                <option key={zone.id} value={zone.name}>{zone.name}</option>
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

      {/* POPIN AJOUT STOCKAGE */}
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
              {storageTypesFromDB.map((st) => (
                <option key={st.id} value={st.name}>{st.name}</option>
              ))}
            </select>

            <label className="block mb-2 font-medium">Taille</label>
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

      {/* SVG */}
      <svg viewBox="0 0 600 600" className="w-full h-[500px] border">
        {zonePositions.map((zone) => (
          <g key={zone.id}>
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.w - 20}
              height={zone.h - 20}
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
              key={child.localId}
              position={{ x: child.x, y: child.y }}
              onDrag={(e, data) => handleDrag(e, data, child)}
              onStop={(e, data) => {
                const inZone = updateParent({
                  ...child,
                  x: data.x,
                  y: data.y,
                });

                if (!inZone) {
                  setStorages((prev) =>
                    prev.map((s) =>
                      s.localId === child.localId
                        ? { ...s, x: initialPos.x, y: initialPos.y }
                        : s
                    )
                  );
                } else {
                  setStorages((prev) =>
                    prev.map((s) =>
                      s.localId === child.localId
                        ? { ...s, x: data.x, y: data.y }
                        : s
                    )
                  );
                }

                setDragOverZone(null);
              }}
            >
              <g style={{ cursor: "grab" }}>
                <rect
                  x={0}
                  y={0}
                  width={child.w}
                  height={child.h}
                  fill="#60A5FA"
                  stroke="#111827"
                  strokeWidth="2"
                />
                <text
                  x={child.w / 2}
                  y={child.h / 2 + 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#111827"
                >
                  {child.name}
                </text>
              </g>
            </Draggable>
          );
        })}
      </svg>
    </div>
  );
}
