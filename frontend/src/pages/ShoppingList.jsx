import { useState, useEffect } from "react";
import dayjs from "dayjs";
import Header from "../components/Header";
import BarCodeScanner from "../components/BarCodeScanner";
import ModalProducts from "../components/ModalProducts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ShoppingList({ homeId }) {
  const [scannedCode, setScannedCode] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  // --- Nouveau wizard multi-step (remplace les 3 anciennes popins)
  const [wizardStep, setWizardStep] = useState(null);

  // Param data utilisé par ModalProducts
  const [manualValues, setManualValues] = useState({
    name: "",
    quantity: "",
    unit: "",
    brand: "",
    ean: "",
  });
  const [manualLock, setManualLock] = useState(false);

  const [expirationDate, setExpirationDate] = useState("");
  const [selectedStorage, setSelectedStorage] = useState(null);

  const [showScannerPopin, setShowScannerPopin] = useState(false);
  const [showFinalPopin, setShowFinalPopin] = useState(false);

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

        // → On lance directement le wizard étape 2 (expiration)
        setWizardStep(2);
      } catch (err) {
        console.error(err);
        setError("Erreur lors de la récupération du produit");
      }
    }

    fetchProduct();
  }, [scannedCode]);

  // --------------------------------------
  // 🆕 OUVRIR MODALE AVEC PRÉREMPLISSAGE (depuis ingrédients menus)
  // --------------------------------------
  const openManualPopinWithPreset = (name, amount = "", unit = "", ing_id = null, unit_id = null) => {
    setManualLock(true);

    setManualValues({
      name,
      quantity: amount,
      unit,
      brand: "",
      ean: "",
      ing_id,
      unit_id,
    });

    setWizardStep(1);
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

  const handleSelectMenu = async (menu) => {
    const exists = selectedMenus.find((m) => m.id === menu.id);
    if (exists) {
      setSelectedMenus(selectedMenus.filter((m) => m.id !== menu.id));
      return;
    }

    const recipesWithIngredients = await Promise.all(
      menu.recipes.map(async (r) => {
        try {
          const res = await fetch(`${API_URL}/recipe/get-one/${r.id}`);
          if (!res.ok) return r;
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

    selectedMenus.forEach((menu) => {
      menu.recipes?.forEach((recipe) => {
        recipe.ingredients?.forEach((ing) => {
          allIngredients.push({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            unit_id: ing.unit_id,
            ing_id: ing.id,
            recipeName: recipe.name,
            menuDate: menu.date,
          });
        });
      });
    });

    const merged = allIngredients.reduce((acc, ing) => {
      const key = `${ing.name.toLowerCase()}-${ing.unit || ""}`;
      if (acc[key]) {
        acc[key].amount =
          Number(acc[key].amount || 0) + Number(ing.amount || 0);
      } else {
        acc[key] = { ...ing, amount: Number(ing.amount || 0) };
      }
      return acc;
    }, {});

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

  // --------------------------------------
  // 🔥 AJOUT FINAL PRODUIT (back-end)
  // --------------------------------------
  const handleInsertProduct = async (finalProduct) => {
    try {
      const body = {
        ing_id: finalProduct.ing_id ?? null,
        amount: finalProduct.quantity,
        unit_id: finalProduct.unit_id ?? null,
        stock_id: finalProduct.stock_id,
        expiry: finalProduct.expiry,
        home_storage_id: finalProduct.storage?.id || null,
        homeId: homeId,
      };

      const res = await fetch(`${API_URL}/product/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Produit ajouté !");
      setWizardStep(null);
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
              setManualLock(false);
              setManualValues({ name: "", quantity: "", unit: "", brand: "", ean: "" });
              setWizardStep(1);
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
                const isSelected = selectedMenus.some((m) => m.id === menu.id);

                return (
                  <div
                    key={menu.id}
                    className={`p-4 rounded-lg shadow-soft flex justify-between items-center cursor-pointer ${
                      isSelected ? "bg-accentGreen text-white" : "bg-white/80"
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
                const unit = item.unit;
                const name = item.name.toLowerCase();
                const amount = Number(item.amount || 1);
                const displayAmount = Number.isInteger(amount)
                  ? amount
                  : amount.toFixed(2);

                const displayQty = unit
                  ? displayAmount + (unit.length <= 2 ? unit : ` ${unit}`)
                  : displayAmount;

                const deWord = unit
                  ? /^[aeiouyh]/i.test(name)
                    ? "d'"
                    : "de "
                  : "";

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

      {/* ------------------ POPIN SCANNER ------------------ */}
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

      {/* ------------------ MODALE PRODUITS (wizard unifié) ------------------ */}
      <ModalProducts
        homeId={homeId}
        mode="create"
        open={wizardStep !== null}
        initialProduct={{
          ...product,
          ...manualValues,
          ing_id: manualValues.ing_id,
          unit_id: manualValues.unit_id,
          expiry: expirationDate,
          storage: selectedStorage
        }}
        manualLock={manualLock}   // ← NOUVEAU ICI
        onClose={() => setWizardStep(null)}
        onSave={(finalProduct) => handleInsertProduct(finalProduct)}
      />

    </div>
  );
}
