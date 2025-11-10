import { useState, useEffect } from "react";
import Header from "../components/Header";
import BarCodeScanner from "../components/BarCodeScanner";
import Tesseract from "tesseract.js";

export default function Stock() {
  const [scannedCode, setScannedCode] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  // Popin OCR / saisie date
  const [showExpirationPopin, setShowExpirationPopin] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // Quand un code est détecté, on interroge l’API OpenFoodFacts
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
          setError("Produit non trouvé dans la base OpenFoodFacts 😕");
          return;
        }

        const p = data.product;
        setProduct({
          name: p.product_name || "Nom inconnu",
          quantity: p.quantity || "Inconnu",
          brand: p.brands || "Marque inconnue",
          nutriments: p.nutriments || {},
          image: p.image_small_url || p.image_front_url || null
        });

        // Ouvrir la popin pour la date de péremption
        setShowExpirationPopin(true);
      } catch (err) {
        console.error(err);
        setError("Erreur lors de la récupération du produit");
      }
    }

    fetchProduct();
  }, [scannedCode]);

  // OCR pour lire la date sur une image
  const scanExpirationDateOCR = async () => {
    if (!imageFile) return;

    try {
      const { data: { text } } = await Tesseract.recognize(imageFile, "fra", {
        logger: m => console.log(m),
      });

      // Regex pour trouver une date au format JJ/MM/AAAA ou JJ-MM-AAAA
      const dateMatch = text.match(/(\d{2}[\/-]\d{2}[\/-]\d{4})/);
      if (dateMatch) {
        setExpirationDate(dateMatch[0]);
      } else {
        setExpirationDate("Non trouvée");
      }
    } catch (err) {
      console.error(err);
      setExpirationDate("Erreur OCR");
    }
  };

  const handleConfirmExpiration = () => {
    setShowExpirationPopin(false);
  };

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8">
      <Header />
      <h1 className="text-2xl font-bold mb-4">Garde-manger v2</h1>

      <h2 className="text-lg font-semibold mb-2">Scanner un produit</h2>
      <BarCodeScanner onDetected={(code) => setScannedCode(code)} />

      {scannedCode && (
        <p className="mt-4">
          Code-barres détecté : <strong>{scannedCode}</strong>
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

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
              <h4 className="font-semibold mb-1">Valeurs nutritionnelles (pour 100g)</h4>
              <ul className="text-sm">
                <li>Énergie : {product.nutriments["energy-kcal_100g"] || "?"} kcal</li>
                <li>Protéines : {product.nutriments.proteins_100g || "?"} g</li>
                <li>Glucides : {product.nutriments.carbohydrates_100g || "?"} g</li>
                <li>Dont sucres : {product.nutriments.sugars_100g || "?"} g</li>
                <li>Matières grasses : {product.nutriments.fat_100g || "?"} g</li>
                <li>Sel : {product.nutriments.salt_100g || "?"} g</li>
              </ul>
            </div>
          )}

          {expirationDate && (
            <p className="mt-2"><strong>Date de péremption :</strong> {expirationDate}</p>
          )}
        </div>
      )}

      {/* POPIN pour la date de péremption */}
      {showExpirationPopin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <h3 className="text-lg font-semibold mb-2">Date de péremption</h3>
            <p className="mb-2">Vous pouvez saisir la date ou utiliser OCR depuis une photo du produit.</p>

            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="border p-2 w-full mb-2"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="mb-2"
            />

            <button
              onClick={scanExpirationDateOCR}
              className="bg-blue-500 text-white p-2 rounded mr-2"
            >
              Scanner OCR
            </button>

            <button
              onClick={handleConfirmExpiration}
              className="bg-green-500 text-white p-2 rounded"
            >
              Valider
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
