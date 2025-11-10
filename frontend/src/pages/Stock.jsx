import { useState, useEffect } from "react";
import Header from "../components/Header";
import BarCodeScanner from "../components/BarCodeScanner";

export default function Stock() {
  const [scannedCode, setScannedCode] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  // Quand un code est détecté, on interroge l’API OpenFoodFacts
  useEffect(() => {
    if (!scannedCode) return;

    async function fetchProduct() {
      setError(null);
      setProduct(null);
      try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${scannedCode}.json`);
        const data = await response.json();

        if (data.status === 0) {
          setError("Produit non trouvé dans la base OpenFoodFacts 😕");
          return;
        }

        const p = data.product;
        setProduct({
          name: p.product_name || "Nom incconu",
          quantity: p.quantity || "Inconnu",
          brand: p.brands || "Marque inconnue",
          nutriments: p.nutriments || {},
          image: p.image_small_url || p.image_front_url || null
        });
      } catch (err) {
        console.error(err);
        setError("Erreur lors de la récupération du produit");
      }
    }

    fetchProduct();
  }, [scannedCode]);

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8">
      <Header />
      <h1 className="text-2xl font-bold mb-4">Garde-manger v2</h1>

      <h2 className="text-lg font-semibold mb-2">Scanner un produit</h2>
      <BarCodeScanner onDetected={(code) => setScannedCode(code)} />

      {scannedCode && (
        <p className="mt-4">Code-barres détecté : <strong>{scannedCode}</strong></p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {product && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
          {product.image && <img src={product.image} alt={product.name} className="w-32 mb-2" />}
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
        </div>
      )}
    </div>
  );
}
