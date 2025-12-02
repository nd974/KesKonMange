import { useState, useEffect } from "react";
import Header from "../components/Header";
import BarCodeScanner from "../components/BarCodeScanner";
import HomeZone from "../components/HomeZone";

export default function ShoppingList({ homeId }) {
  const [scannedCode, setScannedCode] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  // Popin expiration
  const [showExpirationPopin, setShowExpirationPopin] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");

  // Popin stockage
  const [showStoragePopin, setShowStoragePopin] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState(null);

  // --------------------------------------
  // 🔍 SCAN + FETCH OPENFOODFACTS
  // --------------------------------------
  useEffect(() => {
    if (!scannedCode) return;

    async function fetchProduct() {
      setError(null);
      setProduct(null);

      try {
        const response = await fetch(
          `https://world.openfoodfacts.org/api/v2/product/${scannedCode}.json`
        );
        const data = await response.json();

        if (data.status === 0) {
          setError("Produit non trouvé dans OpenFoodFacts 😕");
          return;
        }

        const p = data.product;

        setProduct({
          name: p.product_name || "Nom inconnu",
          quantity: p.quantity || "Inconnu",
          brand: p.brands || "Marque inconnue",
          nutriments: p.nutriments || {},
          image: p.image_small_url || p.image_front_url || null,
          stock_id: null
        });

        setShowExpirationPopin(true);

      } catch (err) {
        console.error(err);
        setError("Erreur lors de la récupération du produit");
      }
    }

    fetchProduct();
  }, [scannedCode]);

  // --------------------------------------
  // 📌 CONFIRMATION STOCKAGE
  // --------------------------------------
  const handleStorageSelection = (storage) => {
    setSelectedStorage(storage);
    setProduct((prev) => ({ ...prev, stock_id: storage.id }));
  };

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8">

      <Header homeId={homeId} />

      <h1 className="text-2xl font-bold mb-4 py-8">
        Garde-manger (Scanner un produit)
      </h1>

      {/* Scanner */}
      <h2 className="text-lg font-semibold mb-2">Scanner un produit</h2>
      <BarCodeScanner onDetected={(code) => setScannedCode(code)} />

      {/* Code affiché */}
      {scannedCode && (
        <p className="mt-4">
          Code-barres détecté : <strong>{scannedCode}</strong>
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Résumé produit OpenFoodFacts */}
      {product && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-2">{product.name}</h3>

          {product.image && (
            <img src={product.image} alt={product.name} className="w-32 mb-2" />
          )}

          <p><strong>Marque :</strong> {product.brand}</p>
          <p><strong>Quantité :</strong> {product.quantity}</p>

          {product.nutriments && (
            <div className="mt-2">
              <h4 className="font-semibold mb-1">
                Valeurs nutritionnelles (pour 100g)
              </h4>
              <ul className="text-sm">
                <li>Énergie : {product.nutriments["energy-kcal_100g"] || "?"} kcal</li>
                <li>Protéines : {product.nutriments.proteins_100g || "?"} g</li>
                <li>Glucides : {product.nutriments.carbohydrates_100g || "?"} g</li>
                <li>Sucres : {product.nutriments.sugars_100g || "?"} g</li>
                <li>Graisses : {product.nutriments.fat_100g || "?"} g</li>
                <li>Sel : {product.nutriments.salt_100g || "?"} g</li>
              </ul>
            </div>
          )}

          {expirationDate && (
            <p className="mt-2">
              <strong>Date de péremption :</strong> {expirationDate}
            </p>
          )}
        </div>
      )}

      {/* Résumé final si stockage défini */}
      {product && expirationDate && product.stock_id && (
        <div className="mt-8 p-4 border rounded bg-green-50">
          <h3 className="text-lg font-bold mb-2">Données prêtes pour l’insertion</h3>
          <ul className="text-sm">
            <li><strong>ing_id :</strong> (à déterminer depuis "{product.name}")</li>
            <li><strong>amount :</strong> {product.quantity}</li>
            <li><strong>unit_id :</strong> (dérivé de la quantité)</li>
            <li><strong>stock_id :</strong> {product.stock_id}</li>
            <li><strong>expiry :</strong> {expirationDate}</li>
            <li><strong>mass :</strong> (converti plus tard)</li>
          </ul>
        </div>
      )}

      {/* POPIN : DATE DE PEREMPTION */}
      {showExpirationPopin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <h3 className="text-lg font-semibold mb-2">Date de péremption</h3>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="border p-2 w-full mb-4"
            />
            <button
              onClick={() => {
                setShowExpirationPopin(false);
                setShowStoragePopin(true); // 🚀 lance HomeZone directement
              }}
              className="bg-green-500 text-white p-2 rounded w-full"
            >
              Valider
            </button>
          </div>
        </div>
      )}

      {/* POPIN : HomeZone */}
      {showStoragePopin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg w-[90%] max-w-3xl h-[80%] overflow-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl"
              onClick={() => setShowStoragePopin(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4 text-center">
              Choisir le stockage
            </h2>

            <HomeZone
              homeId={homeId}
              onSelectStorage={(storage) => {
                handleStorageSelection(storage);
                if (window.innerWidth <= 768) {
                  setShowStoragePopin(false); // ferme popin sur mobile
                }
              }}
              onSelectZone={() => {}}
              inPopin={true}
            />
          </div>
        </div>
      )}

    </div>
  );
}
