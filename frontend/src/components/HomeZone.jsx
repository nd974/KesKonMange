import React, { useState, useEffect, useRef} from "react";
import Draggable from "react-draggable";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function HomeZone({ homeId, onSelectStorage, onSelectZone, inPopin = false}) {
  const [zones, setZones] = useState([]);
  const [storages, setStorages] = useState([]);
  const [dragOverZone, setDragOverZone] = useState(null);

  const [showZoneModal, setShowZoneModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("1x1");
  const [selectedZoneName, setSelectedZoneName] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState(0);

  const [showStorageModal, setShowStorageModal] = useState(false);
  const [selectedStorageType, setSelectedStorageType] = useState("");
  const [selectedStorageId, setSelectedStorageId] = useState(0);
  const [selectedStorageSize, setSelectedStorageSize] = useState("1x1");

  const [zoneNamesFromDB, setZoneNamesFromDB] = useState([]);
  const [storageTypesFromDB, setStorageTypesFromDB] = useState([]);

  const unitPx = 120;
  const gridSize = 5;

  const generateId = () => Math.floor(Math.random() * 100000);

  const [draggedStorageIds, setDraggedStorageIds] = useState({});


  // -------------------------------------
  // 🔄 CHARGEMENT LISTES : ZONES + TYPES STOCKAGES
  // -------------------------------------
  useEffect(() => {
    fetch(`${API_URL}/storage/getAllZones`)
      .then((res) => res.json())
      .then((data) => {
        setZoneNamesFromDB(data);
        if (data.length > 0) {setSelectedZoneName(data[0].name);setSelectedZoneId(data[0].id);};
      });

    fetch(`${API_URL}/storage/getAllStorages`)
      .then((res) => res.json())
      .then((data) => {
        setStorageTypesFromDB(data);
        if (data.length > 0) {setSelectedStorageType(data[0].name); setSelectedStorageId(data[0].id);};
      });
  }, []);

  // -------------------------------------
  // 🔄 CHARGEMENT SVG EXISTANT
  // -------------------------------------
  useEffect(() => {
    if (!homeId) return;

    fetch(`${API_URL}/storage/getSVG?homeId=${homeId}`)
      .then((res) => res.json())
      .then((data) => {
        setZones(
          data.zones.map((z) => ({
            id: z.instance_id,
            name: z.name,
            wUnits: z.w_units,
            hUnits: z.h_units,
            x: z.x,
            y: z.y,
            color: z.color ?? "#FDE68A",
          }))
        );

        console.log(data.storages);

        setStorages(
          data.storages.map((s) => ({
            id: s.instance_id,
            name: s.name,
            parent_id: s.parent_id,
            x: s.x,
            y: s.y,
            wUnits: s.w_units,
            hUnits: s.h_units,
            w: s.w_units * 50,
            h: s.h_units * 50,
            color: s.color ?? "#60A5FA",
            localId: generateId(),
          }))
        );
      })
      .catch((err) => console.error("Erreur chargement SVG:", err));
  }, [homeId]);

  // -------------------------------------
  // 📐 POSITIONNEMENT DES ZONES
  // -------------------------------------
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
    }

    return positions;
  };

  const zonePositions = computeZonePositions(zones);

  // -------------------------------------
  // 📌 DRAG + MISE À JOUR DU PARENT
  // -------------------------------------
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
  };

  // -------------------------------------
  // ➕ AJOUT ZONE
  // -------------------------------------
const handleAddZone = () => {
  const [wUnits, hUnits] = selectedSize.split("x").map(Number);

  // Vérifie la limite totale
  const totalUnits = zones.reduce((acc, z) => acc + (z.wUnits || 0) * (z.hUnits || 0), 0);
  if (totalUnits + wUnits * hUnits > 25) {
    alert("Impossible d'ajouter cette zone : limite totale dépassée.");
    return;
  }

  // Nouvelle zone
  const newZoneData = {
    localId: generateId(),       // identifiant unique local
    id: selectedZoneId || null,  // utilise selectedZoneId si existant, sinon null
    name: selectedZoneName,
    wUnits,
    hUnits,
    x: 10,
    y: 10 + zones.length * 70,
    w: wUnits * 50,
    h: hUnits * 50,
    color: "#FDE68A",
  };

  // Vérifie si un placeholder existe pour ce nom et ce selectedZoneId
  const placeholderIndex = zones.findIndex(
    (z) =>
      z.name === selectedZoneName &&
      (z.wUnits == null || z.hUnits == null || z.x == null || z.y == null) &&
      (!selectedZoneId || z.id === selectedZoneId)
  );

  let newZones;
  if (placeholderIndex !== -1) {
    // Remplace le placeholder par la nouvelle zone
    newZones = [...zones];
    newZones[placeholderIndex] = {
      ...newZones[placeholderIndex],
      ...newZoneData,
      id: newZones[placeholderIndex].id ?? newZoneData.id,
    };
  } else {
    // Ajoute une nouvelle zone sans toucher aux existantes
    newZones = [...zones, newZoneData];
  }

  setZones(newZones);
  setShowZoneModal(false);

  console.log("Zones après ajout :", newZones);
};




  // -------------------------------------
  // ➕ AJOUT STOCKAGE
  // -------------------------------------
  const handleAddStorage = () => {
    const parentZone = zones[0];
    if (!parentZone) return alert("Ajoutez une zone d'abord.");

    const countInZone = storages.filter((s) => s.parent_id === parentZone.id).length;
    const [wUnits, hUnits] = selectedStorageSize.split("x").map(Number);

    console.log("selectedStorageType=",selectedStorageType);
    console.log("selectedStorageId=",selectedStorageId);

    const newStorage = {
      localId: generateId(),
      storageId: selectedStorageId,
      name: selectedStorageType,
      parent_id: parentZone.id,  // ✔ c’est ok
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

  // -------------------------------------
  // ❌ ANNULER
  // -------------------------------------
  const handleAnnul = () => {
    if (storages.length > 0) {
      setStorages((prev) => prev.slice(0, -1));
    } else if (zones.length > 0) {
      setZones((prev) => prev.slice(0, -1));
    } else {
      alert("Aucune zone ou stockage à supprimer");
    }
  };

  // -------------------------------------
  // 💾 SAUVEGARDE
  // -------------------------------------
  const handleSave = async () => {
    try {
      // const allItems = [
      //   ...zones.map((z) => ({
      //     name: z.name,
      //     x: z.x,
      //     y: z.y,
      //     w_units: z.wUnits,
      //     h_units: z.hUnits,
      //     color: z.color ?? "#FDE68A",
      //   })),
      //   ...storages.map((s) => ({
      //     name: s.name,
      //     x: s.x,
      //     y: s.y,
      //     w_units: s.wUnits,
      //     h_units: s.hUnits,
      //     color: s.color ?? "#60A5FA",
      //   })),
      // ];

      // const allItems = [
      //   ...zones.map((z) => ({
      //     id: z.id,               // <-- ***IMPORTANT***
      //     name: z.name,
      //     x: z.x,
      //     y: z.y,
      //     w_units: z.wUnits,
      //     h_units: z.hUnits,
      //     color: z.color,
      //   })),
      //   ...storages.map((s) => ({
      //     id: s.id,               // <-- ***IMPORTANT***
      //     name: s.name,
      //     x: s.x,
      //     y: s.y,
      //     w_units: s.wUnits,
      //     h_units: s.hUnits,
      //     color: s.color,
      //   }))
      // ];
      const allItems = [
        ...zones.map((z) => ({
          instance_id: z.id,
          storage_id: null,
          name: z.name,
          x: z.x,
          y: z.y,
          w_units: z.wUnits,
          h_units: z.hUnits,
          color: z.color,
        })),
        ...storages.map((s) => ({
          instance_id: s.id ?? null,   // id de l’instance pour update
          storage_id: s.storageId,     // ✔ important !
          name: s.name,
          x: s.x,
          y: s.y,
          w_units: s.wUnits,
          h_units: s.hUnits,
          color: s.color,
        }))
      ];

      console.log("allItems= ",allItems);

      const response = await fetch(`${API_URL}/storage/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ home_id: homeId, items: allItems }),
      });

      const data = await response.json();
      if (response.ok) alert("Plan sauvegardé !");
      else alert("Erreur : " + (data.details || data.error));
    } catch (err) {
      alert("Erreur réseau");
      console.error(err);
    }
  };

  // ---------------------------
  // Tailles zones disponibles
  // ---------------------------
  const sizes = [];
  for (let w = 1; w <= 5; w++) {
    for (let h = 1; h <= 5; h++) {
      sizes.push(`${w}x${h}`);
    }
  }


  // -------------------------------------
  // SIZES STOCKAGES
  // -------------------------------------
  const storageSizes = [];
  for (let w = 1; w <= 3; w++) {
    for (let h = 1; h <= 3; h++) {
      storageSizes.push(`${w}x${h}`);
    }
  }

  // -------------------------------------
  // AFFICHAGE
  // -------------------------------------
  return (
    <div className="flex flex-col gap-4">
      {!inPopin && (
        <h1 className="text-2xl font-bold mb-4 text-center">
          Stockages d’ingrédients (Version 2)
        </h1>
      )}

      {/* Boutons */}
      {!inPopin && (
        <div className="grid grid-cols-4 gap-4 mb-4">
          <button
            onClick={() => setShowZoneModal(true)}
            className="w-full px-4 py-2 bg-green-500 text-white rounded"
          >
            🗺️
          </button>

          <button
            onClick={() => setShowStorageModal(true)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded"
          >
            📦
          </button>

          {/* <button
            onClick={handleAnnul}
            className="w-full px-4 py-2 bg-red-500 text-white rounded"
          >
            R
          </button> */}

          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded"
          >
            💾
          </button>
        </div>
      )}


            {/* POPIN AJOUT ZONE */}

      {!inPopin && showZoneModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-xl font-semibold mb-4">Nouvelle zone</h2>

            <label className="block mb-2 font-medium">Nom de la zone</label>
            <select
              value={selectedZoneName}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedZoneName(value);

                // trouver l'objet dans la DB
                const item = storageTypesFromDB.find(st => st.name === value);
                if (item) setSelectedZoneId(item.id);
              }}

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
      {!inPopin && showStorageModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-xl font-semibold mb-4">Nouveau stockage</h2>

            <label className="block mb-2 font-medium">Type de stockage</label>
            <select
              value={selectedStorageType}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedStorageType(value);

                // trouver l'objet dans la DB
                const item = storageTypesFromDB.find(st => st.name === value);
                if (item) setSelectedStorageId(item.id);
              }}
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
        
{/* 🔥 ZONES (cliquables) */}
{
  zonePositions
    .filter(zone => zone.wUnits > 0 && zone.hUnits > 0 && zone.name) // <-- ici on filtre les zones valides
    .map((zone) => (
      <g
        key={zone.id}
        onClick={() => onSelectZone(zone)}
        style={{ cursor: "pointer" }}
      >
        <rect
          x={zone.x}
          y={zone.y}
          width={zone.w - 20}
          height={zone.h - 20}
          fill={dragOverZone === zone.id ? "#FFD700" : zone.color}
          stroke="#111827"
          strokeWidth="2"
        />
        {/* ❌ CROIX SUPPRESSION ZONE (si aucune storage dedans) */}
        {storages.filter(s =>
          s.x != null && s.y != null &&
          s.x >= zone.x &&
          s.x + s.w <= zone.x + zone.w &&
          s.y >= zone.y &&
          s.y + s.h <= zone.y + zone.h
        ).length === 0 && (
          <text
            x={zone.x + (zone.w - 20) - 15}
            y={zone.y + 15}
            fontSize="20"
            fill="red"
            style={{ cursor: "pointer", fontWeight: "bold" }}
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("Voulez-vous vraiment supprimer cette zone ?")) {
                setZones(prev => prev.filter(z => z.id !== zone.id));
              }
            }}
          >
            ×
          </text>
        )}

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
    ))
}


        {/* 🔥 STOCKAGES (cliquables même dans Draggable) */}
{!inPopin &&
  storages
    .filter(child => child.x != null && child.y != null)
    .map((child) => {
    const handleSelect = () => {
      const parentZone = zonePositions.find((z) => z.id === child.parent_id);
      const displayName = parentZone
        ? `${child.name} [${parentZone.name}]`
        : child.name;
      onSelectStorage({ ...child, displayName });
    };

    return (
      <Draggable
        key={child.localId}
        position={{ x: child.x, y: child.y }}
        onStart={() =>
          setDraggedStorageIds((prev) => ({ ...prev, [child.localId]: false }))
        }
        onDrag={() =>
          setDraggedStorageIds((prev) => ({ ...prev, [child.localId]: true }))
        }
        onStop={(e, data) => {
          const dragged = draggedStorageIds[child.localId];
          const inZone = updateParent({ ...child, x: data.x, y: data.y });

          setStorages((prev) =>
            prev.map((s) =>
              s.localId === child.localId
                ? { ...s, x: inZone ? data.x : child.x, y: inZone ? data.y : child.y }
                : s
            )
          );

          setDragOverZone(null);

          if (!dragged) handleSelect();
        }}
      >
        <g
          style={{ cursor: "pointer" }}
          pointerEvents="all"
          onTouchEnd={(e) => {
            e.preventDefault();
            if (!draggedStorageIds[child.localId]) handleSelect();
          }}
        >
          <rect
            x={0}
            y={0}
            width={child.w}
            height={child.h}
            fill="#60A5FA"
            stroke="#111827"
            strokeWidth="2"
          />
          {/* ❌ CROIX SUPPRESSION STORAGE */}
          <text
            x={child.w - 15}
            y={15}
            fontSize="18"
            fill="red"
            style={{ cursor: "pointer", fontWeight: "bold" }}
            onClick={(e) => {
              e.stopPropagation(); // empêche d’ouvrir le stockage
              if (window.confirm("Voulez-vous vraiment supprimer ce stock ?")) {
                setStorages(prev => prev.filter(s => s.localId !== child.localId));
              }
            }}
          >
            ×
          </text>

          <text
            x={child.w / 2}
            y={child.h / 2}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="12"
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
