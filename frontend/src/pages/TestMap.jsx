import React, { useState, useEffect } from "react";
// import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// function MapController({ onMapReady }) {
//   const map = useMap();

//   useEffect(() => {
//     onMapReady(map);
//   }, [map]);

//   return null;
// }

// const homeMarkerIcon = L.divIcon({
//   className: "",
//   html: `
//     <svg width="40" height="40" viewBox="0 0 24 24" fill="#dc2626"
//          xmlns="http://www.w3.org/2000/svg">
//       <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13
//                c0-3.87-3.13-7-7-7zm0 9.5
//                c-1.38 0-2.5-1.12-2.5-2.5
//                S10.62 6.5 12 6.5
//                s2.5 1.12 2.5 2.5
//                S13.38 11.5 12 11.5z"/>
//     </svg>
//   `,
//   iconSize: [40, 40],
//   iconAnchor: [20, 40], // pointe bien au sol
// });

// const shopMarkerIcon = L.divIcon({
//   className: "",
//   html: `
//     <svg width="28" height="28" viewBox="0 0 24 24" fill="blue"
//          xmlns="http://www.w3.org/2000/svg">
//       <path d="M7 18c-1.1 0-1.99.9-1.99 2
//                S5.9 22 7 22s2-.9 2-2
//                -.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2
//                S15.9 22 17 22s2-.9 2-2
//                -.9-2-2-2zM7.17 14h9.66
//                c.75 0 1.41-.41 1.75-1.03
//                l3.58-6.49a1 1 0 00-.87-1.48H6.21
//                l-.94-2H1v2h3l3.6 7.59
//                -1.35 2.44C5.52 16.37 6.48 18 8 18h12v-2H8
//                l1.17-2z"/>
//     </svg>
//   `,
//   iconSize: [28, 28],
//   iconAnchor: [14, 28],
// });

// function ClickableMap({ onMapClick }) {
//   useMapEvents({
//     click(e) {
//       onMapClick(e.latlng); // on remonte la position
//     },
//   });
//   return null;
// }



export default function TestMap({ homeId, profileId }) {
  const [stores, setStores] = useState([]);
  const centerPosition = [47.88516, 1.90147];

  

  const [map, setMap] = useState(null);

//   Modale
    const [pendingPosition, setPendingPosition] = useState(null);
    const [storeName, setStoreName] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStoreIndex, setEditingStoreIndex] = useState(null);

    const handleMapClick = (latlng) => {
        setPendingPosition(latlng);
        setStoreName("");
        setIsModalOpen(true);
    };

    const handleSeeStore = (store) => {
        if (!map) return;

        map.setView([store.lat, store.lng], 19, {
            animate: true,
        });
    };

    const handleConfirmCreate = () => {
  if (!storeName.trim()) return;

  setStores((prev) => [
    ...prev,
    {
      name: storeName,
      lat: pendingPosition.lat,
      lng: pendingPosition.lng,
    },
  ]);

  setIsModalOpen(false);
  setPendingPosition(null);
};


const handleConfirmCreateOrUpdate = () => {
  if (!storeName.trim()) return;

  if (editingStoreIndex !== null) {
    // Mise à jour
    setStores((prev) => {
      const newStores = [...prev];
      newStores[editingStoreIndex] = {
        ...newStores[editingStoreIndex],
        name: storeName,
      };
      return newStores;
    });
  } else {
    // Création
    setStores((prev) => [
      ...prev,
      { name: storeName, lat: pendingPosition.lat, lng: pendingPosition.lng },
    ]);
  }

  setIsModalOpen(false);
  setPendingPosition(null);
  setEditingStoreIndex(null);
};



    const handleDeleteStore = (index) => {
    setStores((prev) => prev.filter((_, i) => i !== index));
    };

    // Fonction pour calculer la distance en km entre deux points (lat/lng)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Rayon de la Terre en km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // distance en km
}


  return (
//     <div>
//       {/* <Header homeId={homeId} /> */}

//       {/* Carte responsive */}
//       <MapContainer
//         center={centerPosition}
//         zoom={19}
//         className="mt-6 w-full h-[400px] sm:h-[500px] md:h-[600px] rounded shadow z-0"
//         whenCreated={setMap}
//       >
//         <MapController onMapReady={setMap} />
//         {/* <MapController onMapReady={setMap} /> */}

//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//         {/* Marqueur au centre avec icône rouge */}
//         <Marker position={centerPosition} icon={homeMarkerIcon} />

//         {stores.map((store, i) => (
//           <Marker
//             key={i}
//             position={[store.lat, store.lng]}
//             icon={shopMarkerIcon}
//             eventHandlers={{
//                 click: () => {
//                 setEditingStoreIndex(i);
//                 setStoreName(store.name);
//                 setPendingPosition({ lat: store.lat, lng: store.lng });
//                 setIsModalOpen(true);
//                 },
//             }}
//             />

//         ))}

//         <ClickableMap onMapClick={handleMapClick} />
//       </MapContainer>

//     {isModalOpen && (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000]">
//         <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
//         <h3 className="text-lg font-semibold mb-3">
//             {editingStoreIndex === null ? "Créer un magasin" : "Modifier le magasin"}
//         </h3>

//         <input
//             type="text"
//             placeholder="Nom du magasin"
//             value={storeName}
//             onChange={(e) => setStoreName(e.target.value)}
//             className="w-full border rounded px-3 py-2 mb-4"
//             autoFocus
//         />

// <div className="flex justify-end gap-2">
//   {editingStoreIndex === null ? (
//     // --- Création ---
//     <>
//       <button
//         onClick={() => setIsModalOpen(false)}
//         className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
//       >
//         Annuler
//       </button>
//       <button
//         onClick={handleConfirmCreateOrUpdate}
//         className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
//       >
//         Créer
//       </button>
//     </>
//   ) : (
//     // --- Edition ---
//     <>
//       <button
//         onClick={() => {
//           setStores((prev) =>
//             prev.filter((_, i) => i !== editingStoreIndex)
//           );
//           setIsModalOpen(false);
//           setEditingStoreIndex(null);
//           setPendingPosition(null);
//         }}
//         className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
//       >
//         Supprimer
//       </button>
//       <button
//         onClick={handleConfirmCreateOrUpdate}
//         className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
//       >
//         Sauvegarder
//       </button>
//     </>
//   )}
// </div>

//         </div>
//     </div>
//     )}


//       <div className="mt-4">
//         <h2 className="font-semibold mb-2">Stores ajoutés :</h2>
//         {stores.length === 0 ? (
//           <p>Aucun store pour le moment. Cliquez sur la carte pour ajouter.</p>
//         ) : (
//         <ul className="space-y-2">
//         {stores.map((store, i) => {
//         const distance = calculateDistance(
//             centerPosition[0], // Home lat
//             centerPosition[1], // Home lng
//             store.lat,
//             store.lng
//         );

//         return (
//             <li key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
//             <span className="text-sm">
//                 🏪 {store.name} [Dist: {distance.toFixed(2)} km] 
//                 {/* Lat: {store.lat.toFixed(5)}, Lng: {store.lng.toFixed(5)}, */}
//             </span>
//             <div className="flex gap-2">
//                 <button onClick={() => handleSeeStore(store)} className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
//                 👁️ See
//                 </button>
//                 <button onClick={() => handleDeleteStore(i)} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
//                 🗑️ Trash
//                 </button>
//             </div>
//             </li>
//         );
//         })}
//         </ul>

//         )}
//       </div>
//     </div>
    <div>Test Map Page</div>
  );
}
