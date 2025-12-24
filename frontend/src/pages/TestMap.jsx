import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Header from "../components/Header";
// npm install leaflet@1.9.4 react-leaflet@4

// Corrige l'icône par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Composant pour gérer le clic sur la carte
function ClickableMap({ stores, setStores }) {
  useMapEvents({
    click(e) {
      setStores([...stores, { lat: e.latlng.lat, lng: e.latlng.lng }]);
    },
  });
  return null;
}

export default function TestMap({ homeId, profileId }) {
  const [stores, setStores] = useState([]);

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8">
      <Header homeId={homeId} />

      {/* Carte responsive */}
      <MapContainer
        center={[48.8566, 2.3522]}
        zoom={12}
        className="mt-6 w-full h-[400px] sm:h-[500px] md:h-[600px] rounded shadow"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {stores.map((store, i) => (
          <Marker key={i} position={[store.lat, store.lng]} />
        ))}
        <ClickableMap stores={stores} setStores={setStores} />
      </MapContainer>

      <div className="mt-4">
        <h2 className="font-semibold mb-2">Stores ajoutés :</h2>
        {stores.length === 0 ? (
          <p>Aucun store pour le moment. Cliquez sur la carte pour ajouter.</p>
        ) : (
          <ul className="list-disc pl-5">
            {stores.map((store, i) => (
              <li key={i}>
                Lat: {store.lat.toFixed(5)}, Lng: {store.lng.toFixed(5)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
