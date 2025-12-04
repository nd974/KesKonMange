import { useState, useEffect } from "react";
import dayjs from "dayjs";
import Header from "../components/Header";
import BarCodeScanner from "../components/BarCodeScanner";
import HomeZone from "../components/HomeZone";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

  // Popins ajout manuel & scanner
  const [showScannerPopin, setShowScannerPopin] = useState(false);
  const [showManualPopin, setShowManualPopin] = useState(false);


  const [showFinalPopin, setShowFinalPopin] = useState(false);

  



  // Champs manuels
  const [manualValues, setManualValues] = useState({
    name: "",
    quantity: "",
    unit: "",
    brand: "",
    ean: "",
  });
  const [manualLock, setManualLock] = useState(false);

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR"); // Format français sans heures, minutes et secondes
  }

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

        const parseQuantity = (q) => {
          if (!q) return { quantity: "Inconnu", unit: "Inconnu" };

          // Exemple : "500 g" → ["500", "g"]
          const match = q.match(/([\d.,]+)\s*([a-zA-Z]+)/);

          if (!match) return { quantity: q, unit: "" };

          return {
            quantity: match[1],
            unit: match[2],
          };
        };
        const { quantity, unit } = parseQuantity(p.quantity);

        setProduct({
          name: p.product_name || "Nom inconnu",
          quantity,
          unit,
          brand: p.brands || "Marque inconnue",
          nutriments: p.nutriments || {},
          image: p.image_small_url || p.image_front_url || null,
          stock_id: null,
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
    setShowStoragePopin(false);
    setShowFinalPopin(true);  // <-- nouvelle popin finale
  };

  // --------------------------------------
  // 🆕 VALIDATION SAISIE MANUELLE
  // --------------------------------------
  const handleManualSubmit = () => {
    if (!manualValues.name || !manualValues.quantity) return;

    setProduct({
      name: manualValues.name,
      brand: manualValues.brand,
      quantity: manualValues.quantity,
      stock_id: null,
      image: null,
      nutriments: {},
      unit: manualValues.unit,
    });

    setShowManualPopin(false);
    setShowExpirationPopin(true);
  };

  const openManualPopinWithPreset = (name, amount = "", unit = "", ing_id = null, unit_id = null) => {
    setManualLock(true);

    setManualValues({
      name,
      quantity: amount,
      unit,
      brand: "",
      ean: "",
      ing_id,        // 🔥 ajouté
      unit_id        // 🔥 ajouté
    });

    setShowManualPopin(true);
  };



  // --------------------------------------
  // 🔹 MENUS + SELECTION MULTI + fetch ingrédients
  // --------------------------------------
  const [menus, setMenus] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);

  useEffect(() => {
    if (!homeId) return;

    const loadMenus = async () => {
      try {
        const res = await fetch(`${API_URL}/menu/get-byHome?homeId=${homeId}`);
        if (!res.ok) throw new Error("Erreur lors du chargement des menus");
        const data = await res.json();

        const formattedMenus = data.map((m) => ({
          id: m.id,
          date: dayjs(m.date).format("YYYY-MM-DD"),
          tagName: m.tag ? m.tag.name : null,
          recipes: m.recipes || [],
        }));

        formattedMenus.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
        setMenus(formattedMenus);
      } catch (e) {
        console.error("Erreur loadMenus:", e);
        setMenus([]);
      }
    };

    loadMenus();
  }, [homeId]);

  // Fetch des recettes complètes avec ingrédients
  const handleSelectMenu = async (menu) => {
    const exists = selectedMenus.find((m) => m.id === menu.id);
    if (exists) {
      setSelectedMenus(selectedMenus.filter((m) => m.id !== menu.id));
      return;
    }

    // Fetch ingrédients pour chaque recette
    const recipesWithIngredients = await Promise.all(
      menu.recipes.map(async (r) => {
        try {
          const res = await fetch(`${API_URL}/recipe/get-one/${r.id}`);
          if (!res.ok) return r; // fallback
          const data = await res.json();
          return { ...r, ingredients: data.ingredients || [] };
        } catch (e) {
          console.error("Erreur fetch recipe:", e);
          return r;
        }
      })
    );

    setSelectedMenus([...selectedMenus, { ...menu, recipes: recipesWithIngredients }]);
  };

  const generateShoppingList = () => {
    const allIngredients = [];

    // Récupérer tous les ingrédients des menus sélectionnés
    selectedMenus.forEach((menu) => {
      menu.recipes?.forEach((recipe) => {
        recipe.ingredients?.forEach((ing) => {
          console.log(ing);
          allIngredients.push({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            unit_id: ing.unit_id,
            ing_id: ing.id,          // 🔥 obligatoire
            recipeName: recipe.name,
            menuDate: menu.date,
          });

        });
      });
    });

    // Fusionner les doublons par nom et unité
    const merged = allIngredients.reduce((acc, ing) => {
      const key = `${ing.name.toLowerCase()}-${ing.unit || ""}`;
      if (acc[key]) {
        acc[key].amount = Number(acc[key].amount || 0) + Number(ing.amount || 0);
      } else {
        acc[key] = { ...ing, amount: Number(ing.amount || 0) };
      }
      return acc;
    }, {});

    // TODO faire en sorte d'eneleverou de dimmuinuer les ingreients deja prenset dans garde manger (product)

    // Retourner sous forme de tableau
    return Object.values(merged);
  };


  const groupedMenus = menus.reduce((acc, m) => {
    acc[m.date] = acc[m.date] || [];
    acc[m.date].push(m);
    return acc;
  }, {});

  const groups = Object.keys(groupedMenus)
    .map((d) => ({ date: d, menus: groupedMenus[d] }))
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));


  const handleInsertProduct = async () => {
    try {
      const body = {
        ing_id: manualValues.ing_id ?? null,     // 🔥 si menu → id, si manuel → null
        amount: manualValues.quantity,
        unit_id: manualValues.unit_id ?? null,   // 🔥 si menu → id, si manuel → null
        stock_id: product.stock_id,
        expiry: expirationDate,
        home_storage_id: selectedStorage.id,
      };


      const res = await fetch(`${API_URL}/product/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Produit ajouté !");
      setShowFinalPopin(false);
      setProduct(null);
      setExpirationDate("");

    } catch (e) {
      console.error(e);
      alert("Erreur lors de l’ajout du produit");
    }
  };


  // --------------------------------------
  // 🔹 RENDER
  // --------------------------------------
  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8">
      <Header homeId={homeId} />

      <div className="mb-8"></div>

      <div className="border rounded-lg p-4 bg-white shadow mb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setShowScannerPopin(true)}
            className="flex-1 bg-gray-700 text-white p-3 rounded-lg flex items-center justify-center gap-2"
          >
            📷 Scanner un code-barres
          </button>

          <button
            onClick={() => {
              setManualLock(false); // 🔓
              setManualValues({ name: "", quantity: "", unit: "", brand: "", ean: "" });
              setShowManualPopin(true);
            }}
            className="flex-1 bg-accentGreen text-white p-3 rounded-lg flex items-center justify-center gap-2"
          >
            ✏️ Saisie manuelle
          </button>

        </div>
      </div>

      <div className="mt-8 flex flex-col gap-8 md:flex-row md:gap-8">
        {/* ------------------ COLONNE MENUS 1/3 ------------------ */}
        <div className="w-full md:w-1/3 md:sticky md:top-4 md:self-start">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Menus enregistrés
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {groups.length === 0 && (
              <p className="text-sm text-gray-500">
                Aucun menu enregistré. Rendez-vous sur le calendrier.
              </p>
            )}

            {groups.map((g) =>
              g.menus.map((menu) => {
                const previewRecipe = menu.recipes?.[0];
                const isSelected = selectedMenus.some((m) => m.id === menu.id);
                console.log("menu",menu);

                return (
                  <div
                    key={menu.id}
                    className={`p-4 rounded-lg shadow-soft flex justify-between items-center cursor-pointer ${
                      isSelected
                        ? "bg-accentGreen text-white"
                        : "bg-white/80"
                    }`}
                    onClick={() => handleSelectMenu(menu)}
                  >
                    <div>
                      <div className="font-semibold text-gray-800">
                        {dayjs(menu.date).format("ddd D MMM")}
                      </div>
                      <div className="text-sm opacity-80">
                        {menu.tagName || "—"}
                      </div>

                    </div>
                    <div className="text-right">
                      {menu.recipes?.length || 0} 🍽️
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ------------------ COLONNE LISTE COURSES 2/3 ------------------ */}
        <div className="w-full md:w-2/3 bg-gray-100 p-4 rounded-lg mb-8">
          <h3 className="text-md font-semibold mb-2">
            Ingrédient manquants pour les Menus :
          </h3>

          {generateShoppingList().length === 0 ? (
            <p className="text-sm text-gray-500">Aucun ingrédient à acheter</p>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {generateShoppingList().map((item, idx) => {
                console.log("item",item);
                const unit = item.unit;
                const name = item.name.toLowerCase();
                const amount = Number(item.amount || 1);
                const displayAmount = Number.isInteger(amount)
                  ? amount
                  : amount.toFixed(2);

                const displayQty = unit
                  ? displayAmount + (unit.length <= 2 ? unit : ` ${unit}`)
                  : displayAmount;

                const deWord = unit ? (/^[aeiouyh]/i.test(name) ? "d'" : "de ") : "";

                return (
                  <li
                    key={idx}
                    className="cursor-pointer hover:text-blue-600 transition"
                    onClick={() =>
                      openManualPopinWithPreset(
                        item.name,
                        item.amount,
                        item.unit,
                        item.ing_id,     
                        item.unit_id     
                      )
                    }


                  >
                    {displayQty} {deWord}
                    {name}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ------------------ POPINS ------------------ */}
      {showScannerPopin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => setShowScannerPopin(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">Scanner</h2>
            <BarCodeScanner
              onDetected={(code) => {
                setShowScannerPopin(false);
                setScannedCode(code);
              }}
            />
          </div>
        </div>
      )}

      {showManualPopin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md relative">
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => setShowManualPopin(false)}
            >
              ❌
            </button>

            <h2 className="text-xl font-bold mb-4 text-center">
              Ajouter manuellement
            </h2>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nom du produit"
                value={manualValues.name}
                disabled={manualLock}   // <----------
                onChange={(e) =>
                  setManualValues({ ...manualValues, name: e.target.value })
                }
                className={`border p-2 rounded ${manualLock ? "bg-gray-100 text-gray-500" : ""}`}
              />

              <input
                type="text"
                placeholder="Marque"
                value={manualValues.brand}
                onChange={(e) =>
                  setManualValues({ ...manualValues, brand: e.target.value })
                }
                className="border p-2 rounded"
              />
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Quantité"
                  value={manualValues.quantity}
                  onChange={(e) =>
                    setManualValues((v) => ({ ...v, quantity: e.target.value }))
                  }
                  className="border p-2 w-1/2"
                />
                <input
                  type="text"
                  placeholder="Unité (g, L, ml...)"
                  value={manualValues.unit}
                  disabled={manualLock}   // <----------
                  onChange={(e) =>
                    setManualValues((v) => ({ ...v, unit: e.target.value }))
                  }
                  className={`border p-2 w-1/2 ${manualLock ? "bg-gray-100 text-gray-500" : ""}`}
                />

              </div>
              <input
                type="text"
                placeholder="Code EAN (optionnel)"
                value={manualValues.ean}
                onChange={(e) =>
                  setManualValues({ ...manualValues, ean: e.target.value })
                }
                className="border p-2 rounded"
              />
              <button
                className="bg-green-600 text-white p-2 rounded"
                onClick={handleManualSubmit}
              >
                Continuer ➜
              </button>
            </div>
          </div>
        </div>
      )}

      {showExpirationPopin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-6 rounded-lg w-80">

            <button
              onClick={() => setShowExpirationPopin(false)}
              className="absolute top-2 right-2 text-red-500 text-xl font-bold"
            >
              ❌
            </button>

            <h3 className="text-lg font-semibold mb-2">Date de péremption</h3>

            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="border p-2 w-full mb-4"
            />

            <button
              onClick={() => {
                if (!expirationDate) return alert("Veuillez sélectionner une date.");
                setShowExpirationPopin(false);
                setShowStoragePopin(true);
              }}
              className="bg-green-500 text-white p-2 rounded w-full"
            >
              Valider
            </button>

          </div>
        </div>
      )}


      {showStoragePopin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg w-[90%] max-w-3xl h-[80%] overflow-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl"
              onClick={() => setShowStoragePopin(false)}
            >
              ❌
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">Choisir le stockage</h2>
            <HomeZone
              homeId={homeId}
              onSelectStorage={(storage) => {
                handleStorageSelection(storage);
                setShowStoragePopin(false);
              }}
              onSelectZone={() => {}}
              inPopin={true}
            />
          </div>
        </div>
      )}

    {showFinalPopin && product && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-[90%] max-w-md relative">

          <button
            className="absolute top-2 right-2 text-xl"
            onClick={() => setShowFinalPopin(false)}
          >
            ❌
          </button>

          <h2 className="text-xl font-bold mb-4 text-center">
            Confirmer le produit
          </h2>

          <ul className="text-sm mb-4 space-y-1">
            <li><strong>Nom :</strong> {product.name}</li>
            <li><strong>Marque :</strong> {product.brand}</li>
            <li><strong>Quantité :</strong> {product.quantity}</li>
            <li><strong>Unité :</strong> {product.unit || "—"}</li>
            <li><strong>Stockage :</strong> {selectedStorage?.name}</li>
            <li><strong>Expiration :</strong> {formatDate(expirationDate)}</li>
          </ul>

          <button
            className="bg-green-600 text-white p-2 rounded w-full"
            onClick={handleInsertProduct}
          >
            ➕ Ajouter le produit
          </button>
        </div>
      </div>
    )}

    </div>
  );
}
