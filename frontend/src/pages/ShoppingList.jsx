import { useState, useEffect, useMemo, useRef } from "react";
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
    quantity_item: "",
    unit_item: "",
    brand: "",
    ean: "",
  });
  const [manualLock, setManualLock] = useState(false);

  const [expirationDate, setExpirationDate] = useState("");
  const [selectedStorage, setSelectedStorage] = useState(null);

  const [showScannerPopin, setShowScannerPopin] = useState(false);
  const [showFinalPopin, setShowFinalPopin] = useState(false);
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([]);
const Unit_hasBuy = [
  // 🧪 Volumes
  1,  // millilitre (mL)
  2,  // centilitre (cL)
  3,  // décilitre (dL)
  4,  // litre (L)
  8,  // pint
  9,  // quart
  10, // gallon

  // ⚖️ Poids
  11, // milligramme
  12, // gramme
  13, // kilogramme
  14, // ounce
  15, // once (fr)
  16, // pound
  17, // livre fr

  // 🧺 Unités physiques (achat)
  20, // pièce
  21, // tranche
  22, // gousse
  23, // tête
  24, // feuille
];

  useEffect(() => {
    const fetchIngredients = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/product/getProducts/${homeId}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
      
    };
    fetchIngredients();
  }, [homeId]);
  // console.log("Fetched products:", products)

  // const [allRecipes, setAllRecipes] = useState([]);

  // useEffect(() => {
  //   const loadRecipes = async () => {
  //     const res = await fetch(`${API_URL}/recipe/get-all`);
  //     const data = await res.json();
  //     setAllRecipes(data);
  //   };
  //   loadRecipes();
  // }, []);
  const recipeCacheRef = useRef({});

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
  const openManualPopinWithPreset = (name, amount = "", unit = "", amount_item = "", unit_item = "", ing_id = null, unit_id = null, unit_item_id = null) => {
    setManualLock(true);

    setManualValues({
      name,
      quantity: amount,
      unit,
      quantity_item: amount_item,
      unit_item: unit_item,
      brand: "",
      ean: "",
      ing_id,
      unit_id,
      unit_item_id,
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
        amount_item: finalProduct.quantity_item || null,
        unit_item_id: finalProduct.unit_item_id || null,
        stock_id: finalProduct.stock_id,
        expiry: finalProduct.expiry,
        home_storage_id: finalProduct.storage?.id || null,
        homeId: homeId,
      };

      console.log("Inserting product with body:", body);

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

const menuStatus = useMemo(() => {
  const status = {};

  // on parcourt tous les menus (sélectionnés)
  selectedMenus.forEach(menu => {
    let missing = 0;
    let inStock = 0;

    menu.recipes?.forEach(recipe => {
      recipe.ingredients?.forEach(ing => {
        const neededAmount = Number(ing.amount || 1);

        // chercher dans les produits existants
        const productInStock =
          products.find(p => String(p.ing_id) === String(ing.id)) ||
          products.find(p => String(p.ingredient_id) === String(ing.id));

        const stockAmount = Number(productInStock?.amount || 0);

        // si unité achetable → comparer quantité
        if (Unit_hasBuy.includes(ing.unit_id)) {
          if (stockAmount >= neededAmount) inStock += 1;
          else missing += 1;
        } else {
          // unité non-achetable → juste 1 occurrence
          if (!productInStock) missing += 1;
          else inStock += 1;
        }
      });
    });

    status[menu.id] = { missing, inStock };
  });

  return status;
}, [products, selectedMenus]);

// const recipeById = useMemo(() => {
//   const map = {};
//   allRecipes.forEach(r => {
//     map[r.id] = r;
//   });
//   return map;
// }, [allRecipes]);

// const expandIngredient = (ingredient, multiplier = 1, visited = new Set()) => {
//   if (!ingredient.recipe_id) {
//     return [{
//       ...ingredient,
//       amount: ingredient.amount * multiplier
//     }];
//   }

//   const recipe = recipeById[ingredient.recipe_id];

//   // ❗ recette absente → fallback (important)
//   if (!recipe || !recipe.ingredients?.length) {
//     return [{
//       ...ingredient,
//       amount: ingredient.amount * multiplier
//     }];
//   }

//   if (visited.has(recipe.id)) {
//     console.warn("Boucle recette:", recipe.id);
//     return [];
//   }

//   visited.add(recipe.id);

//   let result = [];

//   recipe.ingredients.forEach(subIng => {
//     result.push(
//       ...expandIngredient(
//         {
//           name: subIng.name,
//           ing_id: subIng.id,
//           recipe_id: subIng.recipe_id,
//           amount: Number(subIng.amount || 1),
//           unit: subIng.unit,
//           unit_id: subIng.unit_id,
//           amount_item: Number(subIng.amount_item || 0),
//           unit_item: subIng.unit_item,
//           unit_item_id: subIng.unit_item_id
//         },
//         ingredient.amount * multiplier, // 🔥 multiplication correcte
//         visited
//       )
//     );
//   });

//   return result;
// };

const expandIngredientAsync = async (
  ingredient,
  multiplier = 1,
  visited = new Set()
) => {
  // 👉 ingrédient simple
  if (!ingredient.recipe_id) {
    return [{
      ...ingredient,
      amount: ingredient.amount * multiplier,
    }];
  }

  // 🛑 protection boucle
  if (visited.has(ingredient.recipe_id)) {
    console.warn("Boucle de recette détectée:", ingredient.recipe_id);
    return [];
  }

  visited.add(ingredient.recipe_id);

  // 🔥 cache
  if (!recipeCacheRef.current[ingredient.recipe_id]) {
    const res = await fetch(
      `${API_URL}/recipe/get-one/${ingredient.recipe_id}`
    );
    if (!res.ok) {
      console.warn("Recette introuvable:", ingredient.recipe_id);
      return [{
        ...ingredient,
        amount: ingredient.amount * multiplier,
      }];
    }
    recipeCacheRef.current[ingredient.recipe_id] = await res.json();
  }

  const recipe = recipeCacheRef.current[ingredient.recipe_id];

  if (!recipe.ingredients?.length) {
    return [{
      ...ingredient,
      amount: ingredient.amount * multiplier,
    }];
  }

  let expanded = [];

  for (const subIng of recipe.ingredients) {
    expanded.push(
      ...(await expandIngredientAsync(
        {
          name: subIng.name,
          ing_id: subIng.id,
          recipe_id: subIng.recipe_id,
          amount: Number(subIng.amount || 1),
          unit: subIng.unit,
          unit_id: subIng.unit_id,
          amount_item: Number(subIng.amount_item || 0),
          unit_item: subIng.unit_item,
          unit_item_id: subIng.unit_item_id,
        },
        ingredient.amount * multiplier,
        visited
      ))
    );
  }

  return expanded;
};


const mergeIngredients = (ingredients) => {
  return Object.values(
    ingredients.reduce((acc, ing) => {
      const isBuyable = Unit_hasBuy.includes(ing.unit_id);

      // clé de fusion
      const key = isBuyable
        ? `${ing.ing_id}-${ing.unit_id}`
        : `${ing.ing_id}`;

      if (!acc[key]) {
        acc[key] = { ...ing };
      } else {
        if (isBuyable) {
          acc[key].amount += ing.amount;
        }
        // non achetable → on garde 1 occurrence
      }

      return acc;
    }, {})
  );
};

const generateShoppingList = async () => {
  const allIngredients = [];

  for (const menu of selectedMenus) {
    for (const recipe of menu.recipes || []) {
      for (const ing of recipe.ingredients || []) {

        const baseIngredient = {
          name: ing.name,
          ing_id: ing.id,
          recipe_id: ing.recipe_id,
          amount: Number(ing.amount || 1),
          unit: ing.unit,
          unit_id: ing.unit_id,
          amount_item: Number(ing.amount_item || 0),
          unit_item: ing.unit_item,
          unit_item_id: ing.unit_item_id
        };

        const expanded = await expandIngredientAsync(baseIngredient);
        allIngredients.push(...expanded);
      }
    }
  }

  // 🔥 fusion eau / farine / etc
  const mergedIngredients = mergeIngredients(allIngredients);

  // 🔽 soustraction stock (identique à avant)
  const shoppingList = [];

  mergedIngredients.forEach((ingredient) => {
    const productInStock = products.find(
      (p) => p.ing_id === ingredient.ing_id
    );

    const isBuyable = Unit_hasBuy.includes(ingredient.unit_id);

    if (!isBuyable) {
      if (!productInStock) {
        shoppingList.push({
          name: ingredient.name,
          ing_id: ingredient.ing_id,
          amount: 1,
          unit: null,
          unit_id: null,
        });
      }
      return;
    }

    let remainingAmount = ingredient.amount;

    if (productInStock && productInStock.unit_id === ingredient.unit_id) {
      remainingAmount -= Number(productInStock.amount || 0);
    }

    if (remainingAmount > 0) {
      shoppingList.push({
        ...ingredient,
        amount: Number(remainingAmount.toFixed(2)),
      });
    }
  });

  return shoppingList;
};

const [shoppingList, setShoppingList] = useState([]);
const [shoppingLoading, setShoppingLoading] = useState(false);

useEffect(() => {
  const buildShoppingList = async () => {
    setShoppingLoading(true);
    try {
      const list = await generateShoppingList();
      setShoppingList(list);
    } catch (e) {
      console.error("Erreur génération shopping list:", e);
      setShoppingList([]);
    } finally {
      setShoppingLoading(false);
    }
  };

  // recalcul quand ça a du sens
  if (selectedMenus.length > 0) {
    buildShoppingList();
  } else {
    setShoppingList([]);
  }
}, [selectedMenus, products]);

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
              setManualValues({ name: "", quantity: "", unit: "", quantity_item: "", unit_item: "", brand: "", ean: "" });
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
<div className="text-right flex flex-col items-end text-sm">
  {menuStatus[menu.id] && (
    <>
      {menuStatus[menu.id].inStock > 0 && (
        <span className="text-green-500 font-bold">{menuStatus[menu.id].inStock}✅</span>
      )}
      {menuStatus[menu.id].missing > 0 && (
        <span className="text-red-500 font-bold ml-1">{menuStatus[menu.id].missing}❌</span>
      )}
    </>
  )}
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

{shoppingLoading ? (
  <p className="text-sm text-gray-500">Calcul en cours…</p>
) : shoppingList.length === 0 ? (
  <p className="text-sm text-gray-500">Aucun ingrédient à acheter</p>
) : (
  <ul className="list-disc list-inside space-y-1">
    {shoppingList.map((item, idx) => {
      const isBuyable = Unit_hasBuy.includes(item.unit_id);

      const name = item.name.toLowerCase();
      const amount = Number(item.amount || 1);
      const displayAmount = Number.isInteger(amount)
        ? amount
        : amount.toFixed(2);

      if (isBuyable) {
        const unit = item.unit;
        const displayQty = unit
          ? displayAmount + (unit.length <= 2 ? unit : ` ${unit}`)
          : displayAmount;

        const itemQty = item.amount_item
          ? `[${item.amount_item}${item.unit_item || ""}]`
          : "";

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
                item.amount_item,
                item.unit_item,
                item.ing_id,
                item.unit_id,
                item.unit_item_id
              )
            }
          >
            {displayQty} {itemQty} {deWord}{name}
          </li>
        );
      }

      return (
        <li
          key={idx}
          className="cursor-pointer hover:text-blue-600 transition"
          onClick={() =>
            openManualPopinWithPreset(
              item.name,
              1,
              null,
              null,
              null,
              item.ing_id,
              null,
              null
            )
          }
        >
          {name} [x1]
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
          unit_item_id: manualValues.unit_item_id,
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
