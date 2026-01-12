import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ================= MAP CONTROLLER ================= */
function MapController({ onMapReady }) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      onMapReady(map);
      setTimeout(() => map.invalidateSize(), 100);
    }
  }, [map]);

  return null;
}

/* ================= ICONS ================= */
const homeMarkerIcon = L.divIcon({
  className: "",
  html: `
    <svg width="40" height="40" viewBox="0 0 24 24" fill="#dc2626"
         xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13
               c0-3.87-3.13-7-7-7zm0 9.5
               c-1.38 0-2.5-1.12-2.5-2.5
               S10.62 6.5 12 6.5
               s2.5 1.12 2.5 2.5
               S13.38 11.5 12 11.5z"/>
    </svg>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const shopMarkerIcon = L.divIcon({
  className: "",
  html: `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="blue"
         xmlns="http://www.w3.org/2000/svg">
      <path d="M7 18c-1.1 0-1.99.9-1.99 2
               S5.9 22 7 22s2-.9 2-2
               -.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2
               S15.9 22 17 22s2-.9 2-2
               -.9-2-2-2zM7.17 14h9.66
               c.75 0 1.41-.41 1.75-1.03
               l3.58-6.49a1 1 0 00-.87-1.48H6.21
               l-.94-2H1v2h3l3.6 7.59
               -1.35 2.44C5.52 16.37 6.48 18 8 18h12v-2H8
               l1.17-2z"/>
    </svg>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

/* ================= CLICK MAP ================= */
function ClickableMap({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

/* ================= UTILS ================= */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/* ================= MAIN ================= */
export default function TestMap({ homeId }) {
  const centerPosition = [47.88516, 1.90147];

  const [map, setMap] = useState(null);
  const [stores, setStores] = useState([]);

  const [pendingPosition, setPendingPosition] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStoreIndex, setEditingStoreIndex] = useState(null);

  /* ================= API ================= */
  async function loadShops() {
    if (!homeId) return;

    const res = await fetch(`${API_URL}/shops/get-all/${homeId}`);
    const data = await res.json();

    setStores(
      data.map((s) => ({
        id: s.id,
        name: s.shop_name,
        lat: s.shop_lat,
        lng: s.shop_long,
      }))
    );
  }

  async function createShop() {
    const res = await fetch(`${API_URL}/shops/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        home_id: homeId,
        shop_name: storeName,
        shop_lat: pendingPosition.lat,
        shop_long: pendingPosition.lng,
      }),
    });

    const s = await res.json();

    setStores((prev) => [
      ...prev,
      { id: s.id, name: s.shop_name, lat: s.shop_lat, lng: s.shop_long },
    ]);
  }

  async function updateShop(id) {
    const res = await fetch(`${API_URL}/shops/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop_name: storeName,
        shop_lat: pendingPosition.lat,
        shop_long: pendingPosition.lng,
      }),
    });

    const s = await res.json();

    setStores((prev) =>
      prev.map((st) => (st.id === id ? { ...st, name: s.shop_name } : st))
    );
  }

  async function deleteShop(id) {
    const ok = window.confirm("❗ Supprimer définitivement ce magasin ?");
    if (!ok) return;

    await fetch(`${API_URL}/shops/delete/${id}`, { method: "DELETE" });
    setStores((prev) => prev.filter((s) => s.id !== id));
  }

  /* ================= EFFECT ================= */
  useEffect(() => {
    loadShops();
  }, [homeId]);

  /* ================= HANDLERS ================= */
  const handleMapClick = (latlng) => {
    setPendingPosition(latlng);
    setStoreName("");
    setEditingStoreIndex(null);
    setIsModalOpen(true);
  };

  const handleSeeStore = (store) => {
    if (!map) return;
    map.setView([store.lat, store.lng], 19, { animate: true });
  };

  const handleConfirm = async () => {
    if (!storeName.trim()) return;

    if (editingStoreIndex !== null) {
      await updateShop(stores[editingStoreIndex].id);
    } else {
      await createShop();
    }

    setIsModalOpen(false);
    setPendingPosition(null);
    setEditingStoreIndex(null);
  };

  /* ================= RENDER ================= */
  return (
    <div className="mt-8 flex flex-col md:flex-row gap-4">
      {/* MAP */}
      <div className="md:w-2/3 w-full h-[50vh] sm:h-[75vh]">
        <MapContainer
          center={centerPosition}
          zoom={19}
          className="w-full h-full rounded shadow"
          whenCreated={setMap}
        >
          <MapController onMapReady={setMap} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <Marker position={centerPosition} icon={homeMarkerIcon} />

          {stores.map((s, i) => (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={shopMarkerIcon}
              eventHandlers={{
                click: () => {
                  setEditingStoreIndex(i);
                  setStoreName(s.name);
                  setPendingPosition({ lat: s.lat, lng: s.lng });
                  setIsModalOpen(true);
                },
              }}
            />
          ))}

          <ClickableMap onMapClick={handleMapClick} />
        </MapContainer>
      </div>

      {/* LIST */}
      <div className="md:w-1/3 w-full bg-white rounded shadow p-4 max-h-[75vh] overflow-y-auto">
        <h2 className="font-semibold mb-3">Stores ajoutés</h2>

        {stores.map((store) => {
          const km = calculateDistance(
            centerPosition[0],
            centerPosition[1],
            store.lat,
            store.lng
          );

          return (
            <div
              key={store.id}
              className="flex justify-between items-center bg-gray-50 p-2 mb-2 rounded"
            >
              <div className="text-sm">
                🏪 {store.name}
                <div className="text-xs text-gray-500">
                  {km.toFixed(2)} km
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSeeStore(store)}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  👁️ See
                </button>
                <button
                  onClick={() => deleteShop(store.id)}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  🗑️ Trash
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000]">
          <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-3">
              {editingStoreIndex === null
                ? "Créer un magasin"
                : "Modifier le magasin"}
            </h3>

            <input
              className="w-full border rounded px-3 py-2 mb-4"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Nom du magasin"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 rounded bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                className="px-3 py-1 rounded bg-blue-600 text-white"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
