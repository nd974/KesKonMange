import React, { useState, useEffect, useRef} from "react";
import Draggable from "react-draggable";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function HomeZone({ homeId, onSelectStorage, onSelectZone, onStoragesLoaded, inPopinStorageSelect = null, inManage=false}) {
  const [zones, setZones] = useState([]);
  const [storages, setStorages] = useState([]);
  const [dragOverZone, setDragOverZone] = useState(null);

  const [showZoneModal, setShowZoneModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("1x1");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [selectedZoneName, setSelectedZoneName] = useState("");

  const [showStorageModal, setShowStorageModal] = useState(false);
  const [selectedStorageType, setSelectedStorageType] = useState("");
  const [selectedStorageId, setSelectedStorageId] = useState("");
  const [selectedStorageSize, setSelectedStorageSize] = useState("1x1");

  const [zoneNamesFromDB, setZoneNamesFromDB] = useState([]);
  const [storageTypesFromDB, setStorageTypesFromDB] = useState([]);

  const unitPx = 120;
  const gridSize = 5;

  const generateId = () => Math.floor(Math.random() * 100000);

  const [draggedStorageIds, setDraggedStorageIds] = useState({});

  const [selectedStorageLocalId, setSelectedStorageLocalId] = useState(null);


  const isSelected = (child) => {
    console.log("isSelected [child]", child);
    console.log("isSelected [selectedStorageLocalId]", selectedStorageLocalId);
    console.log("isSelected [inPopinStorageSelect]", inPopinStorageSelect);
    console.log("isSelected [child.id]", child.instance_id);
    if (inPopinStorageSelect) {
      return Number(child.id) === Number(inPopinStorageSelect);
    }
    return child.localId === selectedStorageLocalId;
  };

  console.log("HomeZone [inPopinStorageSelect]", inPopinStorageSelect);

  // -------------------------------------
  // 🔄 CHARGEMENT LISTES : ZONES + TYPES STOCKAGES
  // -------------------------------------
  useEffect(() => {
    fetch(`${API_URL}/storage/getAllZones`)
      .then((res) => res.json())
      .then((data) => {
        setZoneNamesFromDB(data);
      });

    fetch(`${API_URL}/storage/getAllStorages`)
      .then((res) => res.json())
      .then((data) => {
        setStorageTypesFromDB(data);
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
            storage_id: z.storage_id,
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
            storageId: s.storage_id,
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

  // ------------------------------------------------------
  // ✅ Envoyer les storages au parent quand ils changent
  // ------------------------------------------------------
  useEffect(() => {
    if (onStoragesLoaded && storages.length > 0) {
      onStoragesLoaded(storages);
    }
  }, [storages]);

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

    if (!selectedZoneId) {
      alert("Veuillez choisir une zone.");
      return;
    }

    const totalUnits = zones.reduce((acc, z) => acc + z.wUnits * z.hUnits, 0);
    if (totalUnits + wUnits * hUnits > 25) {
      alert("Impossible d'ajouter cette zone : limite totale dépassée.");
      return;
    }

    const newZone = {
      id: generateId(),
      storage_id: selectedZoneId,
      name: selectedZoneName,
      wUnits,
      hUnits,
      x: 10,
      y: 10 + zones.length * 70,
      color: "#FDE68A",
      w: wUnits * 50,
      h: hUnits * 50,
    };

    console.log("Adding zone:", newZone);

    setZones([...zones, newZone]);

    console.log("zone:", zones);
    setShowZoneModal(false);
  };

  // -------------------------------------
  // ➕ AJOUT STOCKAGE
  // -------------------------------------
  const handleAddStorage = () => {

    if (!selectedStorageId) {
      alert("Veuillez choisir un type de stockage.");
      return;
    }

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
      const allItems = [
        ...zones.map((z) => ({
          instance_id: z.id,
          storage_id: z.storage_id,
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
    <div     className="
      flex flex-col gap-4
      bg-white
      border border-gray-200
      rounded-2xl
      p-6
      shadow-lg
      hover:shadow-xl
      transition-shadow
    ">
      {!inPopinStorageSelect && (
        <h1 className="text-2xl font-bold mb-4 text-center">
          Plan Maison
        </h1>
      )}

      {/* Boutons */}
      {(!inPopinStorageSelect && inManage)&& (
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

          <button
            onClick={handleAnnul}
            className="w-full px-4 py-2 bg-red-500 text-white rounded"
          >
            R
          </button>

          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded"
          >
            💾
          </button>
        </div>
      )}


            {/* POPIN AJOUT ZONE */}

      {!inPopinStorageSelect && showZoneModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-xl font-semibold mb-4">Nouvelle zone</h2>

            <label className="block mb-2 font-medium">Nom de la zone</label>
            <select
              value={selectedZoneId}
              onChange={(e) => {
                const id = e.target.value;
                const z = zoneNamesFromDB.find(z => z.id == id);

                setSelectedZoneId(id);
                setSelectedZoneName(z ? z.name : "");
              }}
              className="w-full mb-4 p-2 border rounded"
            >
              <option value="">-- Choisir --</option>

              {zoneNamesFromDB.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
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
      {!inPopinStorageSelect && showStorageModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-xl font-semibold mb-4">Nouveau stockage</h2>

            <label className="block mb-2 font-medium">Type de stockage</label>
            <select
              value={selectedStorageId}
              onChange={(e) => {
                const id = e.target.value;
                const st = storageTypesFromDB.find(s => s.id == id);

                setSelectedStorageId(id);
                setSelectedStorageType(st ? st.name : "");
              }}
              className="w-full mb-4 p-2 border rounded"
            >
              <option value="">-- Choisir --</option>

              {storageTypesFromDB.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>

            <label className="block mb-2 font-medium">Taille</label>
            <select
              value={selectedStorageSize}
              onChange={(e) => setSelectedStorageSize(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
            >
              <option value="0">-- Choisir --</option>
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
        {zonePositions.map((zone) => (
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

        {inPopinStorageSelect && storages.map((child) => (
          <g
            key={child.localId}
            style={{ cursor: "pointer" }}
            onClick={() => {
              const parentZone = zonePositions.find(z => z.id === child.parent_id);
              const displayName = parentZone ? `${child.name} [${parentZone.name}]` : child.name;
              onSelectStorage({ ...child, displayName });

              // Si on est sur mobile et en popin, on peut fermer la popin / passer à la suite
              if (inPopinStorageSelect && window.innerWidth <= 768) {
                // Ici tu peux déclencher la fermeture de la popin ou la navigation
                // ex: setShowHomeZonePopin(false)
              }
            }}
          >
            <rect
              x={child.x}
              y={child.y}
              width={child.w}
              height={child.h}
              fill={isSelected(child) ? "#ff7300ff" : "#60A5FA"}
              stroke="#111827"
              strokeWidth="2"
            />
            <text
              x={child.x + child.w / 2}
              y={child.y + child.h / 2}
              textAnchor="middle"
              fontSize="12"
              fill="#111827"
            >
              {child.name}
            </text>
          </g>
        ))}

        {/* 🔥 STOCKAGES (cliquables même dans Draggable) */}
{!inPopinStorageSelect &&
  storages.map((child) => {
    const handleSelect = () => {
      setSelectedStorageLocalId(child.localId);
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
            fill={child.localId === selectedStorageLocalId ? "#ff7300ff" : "#60A5FA"}  // <- NEW
            stroke="#111827"
            strokeWidth="2"
          />
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
