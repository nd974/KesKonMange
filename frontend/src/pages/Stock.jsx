import { useState, useEffect } from "react";
import Header from "../components/Header";
import HomeZone from "../components/HomeZone";
import ModalProducts from "../components/modals/ModalProducts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { CLOUDINARY_RES, CLOUDINARY_RECETTE_NOTFOUND } from "../config/constants";

export default function Stock({ homeId }) {
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const [storages, setStorages] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState("all");

  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editProduct, setEditProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [manualLock, setManualLock] = useState(false);
  const [wizardStep, setWizardStep] = useState(null);
  const [manualValues, setManualValues] = useState({
    name: "",
    quantity: "",
    unit: "",
    quantity_item: "",
    unit_item: "",
    brand: "",
    ean: "",
  });

  const nb_day_postmeal = 7;
  const today = new Date();

  // Récupération ingrédients
  useEffect(() => {
    const fetchIngredients = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/product/getProducts/${homeId}`);
        const data = await response.json();
        setIngredients(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIngredients();
  }, [homeId]);

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("fr-FR");
  }

  function getExpirationStatus(dateStr) {
    const date = new Date(dateStr);
    const diff = (date - today) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "expired";
    if (diff <= nb_day_postmeal) return "soon";
    return "ok";
  }

  function handleSort(column) {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  }


function handleSort(column) {
  if (sortColumn === column) {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  } else {
    setSortColumn(column);
    setSortOrder("asc");
  }
}

// Tri des ingrédients en fonction de la colonne sélectionnée
  const filteredIngredients = ingredients
    .filter(i => {
      if (selectedStorage === "all") return true;
      if (!selectedStorage) return i.stock_id === null;
      if (!selectedStorage.ids) return false;
      return selectedStorage.ids.includes(i.stock_id);
    })
    .filter(i => i.ingredient_name.toLowerCase().includes(search.toLowerCase()))
    .filter(i => (unitFilter ? i.unit_name === unitFilter : true))
    .sort((a, b) => {
      if (!sortColumn) return 0;

      let v1 = a[sortColumn];
      let v2 = b[sortColumn];

      // Si c'est une date, il faut la convertir en objet Date
      if (sortColumn === "expiry") {
        v1 = new Date(v1);
        v2 = new Date(v2);
      }

      if (v1 < v2) return sortOrder === "asc" ? -1 : 1;
      if (v1 > v2) return sortOrder === "asc" ? 1 : -1;

      return 0;
    });

  const totalPages = Math.ceil(filteredIngredients.length / ITEMS_PER_PAGE);

  const paginatedIngredients = filteredIngredients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  // Création d'un tableau de stockages fusionnés
const groupedStorages = Object.values(
  storages.reduce((acc, s) => {
    const name = s.displayName || s.name;

    if (!acc[name]) {
      acc[name] = {
        name,
        ids: [],
        representative: s
      };
    }

    acc[name].ids.push(s.id);

    return acc;
  }, {})
);

async function handleUpdateProduct(updated) {
  if (!editProduct) return;

  try {
    const res = await fetch(`${API_URL}/product/update/${homeId}/${editProduct.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Erreur : " + data.error);
      return;
    }

    // Mise à jour locale
    setIngredients(prev =>
      prev.map(p =>
        p.id === editProduct.id
          ? { ...p, ...updated }
          : p
      )
    );

    setShowModal(false);
  } catch (e) {
    console.error(e);
    alert("Erreur réseau");
  }
}



  async function deleteProduct(id) {
    if (!confirm("Supprimer ce produit ?")) return;

    try {
      const res = await fetch(`${API_URL}/product/delete/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (data.ok) {
        setIngredients(prev => prev.filter(p => p.id !== id));
      } else {
        alert("Erreur : " + data.error);
      }

    } catch (e) {
      alert("Erreur réseau");
    }
  }

  

  // Composant pour afficher quantité + unité + quantité item
function DisplayIngredient({ ing }) {
  if (!ing) return null;

  const unit = ing.unit_name || "";
  const amount = Number(ing.amount || 0);
  const displayAmount = Number.isInteger(amount) ? amount : amount.toFixed(2);

  const displayQty = unit
    ? displayAmount + (unit.length <= 2 ? unit : ` ${unit}`)
    : displayAmount;

  const hasItemUnit = ing.amount_item && ing.unit_item_name;
  let displayAmountItem = null;
  let amountItem = Number(ing.amount_item || 0);
  if (hasItemUnit) {
    displayAmountItem = Number.isInteger(amountItem) ? amountItem : amountItem.toFixed(2);
  }

  return (
    <>
      {displayQty}
      {hasItemUnit && <> de {displayAmountItem} {ing.unit_item_name}</>}
    </>
  );
}

const handleInsertProduct = async (finalProduct) => {
    try {
      const body = {
        ing_id: finalProduct.ing_id ?? null,
        ing_name: finalProduct.name ?? null,
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
      // setProduct(null);
      // setExpirationDate("");
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l’ajout du produit");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStorage, unitFilter, sortColumn, sortOrder]);

// const units = [...new Set(ingredients.map(i => i.unit_name))];

console.log(ingredients);

  return (
    <div className="">

      {/* <Header homeId={homeId} /> */}

      <div className="flex flex-col lg:flex-row gap-6 py-6">

        {/* HomeZone */}
        <div className="w-full lg:w-1/3 mt-5">
          <HomeZone
            key={homeId}
            homeId={homeId}
            onSelectStorage={(storage) => {
              if (!storage) {
                  setSelectedStorage(null); 
                  return;
              }

              // créer un groupe à partir d’un stockage unique
              setSelectedStorage({
                  name: storage.displayName || storage.name,
                  ids: [storage.id],
                  representative: storage
              });
          }}

            onSelectZone={() => setSelectedStorage(null)}
            onStoragesLoaded={setStorages}
          />
        </div>

        {/* Section Liste / Recherche / filtres */}
        <div className="w-full lg:w-2/3">

          {/* ✅ RECHERCHE en haut */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">
              {selectedStorage === "all" && "Tous les ingrédients"}
              {!selectedStorage && "Ingrédients à replacer"}
              {selectedStorage && selectedStorage !== "all" &&
                `Ingrédients dans ${selectedStorage.displayName || selectedStorage.name}`}
            </h2>
            <div className="controls flex flex-wrap md:flex-nowrap items-center gap-2">
              <input
                className="search-bar flex-1 min-w-[150px] p-2 border rounded"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Recherche un ingrédient..."
              />

              <button
                className="px-4 py-2 rounded hover:bg-softPink flex items-center gap-2 bg-accentGreen text-white font-bold"
                onClick={() => {
                  setManualLock(false);
                  setManualValues({ name: "", quantity: "", unit: "", quantity_item: "", unit_item: "", brand: "", ean: "" });
                  setWizardStep(1);
                }}
              >
                Ajouter Produits
              </button>
            </div>
          </div>

          <ModalProducts
            homeId={homeId}
            mode="create"
            open={wizardStep !== null}
            manualLock={manualLock}   // ← NOUVEAU ICI
            onClose={() => setWizardStep(null)}
            onSave={(finalProduct) => handleInsertProduct(finalProduct)}
          />

          {/* ✅ FILTRES en bas */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">

            {/* Filtre stockage */}
            <div className="flex flex-col w-full md:w-full">{/*md:w-1/2*/}
              <label>Stockage</label>
              <select
                className="border px-3 py-2 rounded"
                value={
                  selectedStorage === "all"
                    ? "all"
                    : selectedStorage
                      ? selectedStorage.name
                      : ""
                }
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    setSelectedStorage(null);      // à replacer
                    return;
                  }
                  if (value === "all") {
                    setSelectedStorage("all");     // tout
                    return;
                  }

                  const group = groupedStorages.find(g => g.name === value);

                  setSelectedStorage(group);
                }}
              >
                <option value="all">Tous</option>
                <option value="">À replacer</option>

                {groupedStorages.map(g => (
                  <option key={g.name} value={g.name}>
                    {g.name} ({g.ids.length})
                  </option>
                ))}
              </select>

            </div>

            {/* Filtre unité
            <div className="flex flex-col w-full md:w-1/2">
              <label>Unité</label>
              <select
                className="border px-3 py-2 rounded"
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
              >
                <option value="">Toutes</option>
                {units.map((u, i) => (
                  <option key={i} value={u}>{u}</option>
                ))}
              </select>
            </div> */}

          </div>

          {/* TABLEAU */}
          <table className="w-full border mt-2 table-fixed">
            <thead className="bg-gray-200">

              <tr>
                <th
                  className="border px-2 py-1 w-16 text-center"
                >
                  Image
                </th>
                <th
                  className="border px-2 py-1 cursor-pointer select-none"
                  onClick={() => handleSort("ingredient_name")} // Utilisation de ingredient_name pour trier par nom
                >
                  Nom
                  {sortColumn === "ingredient_name" && (sortOrder === "asc" ? " ▲" : " ▼")}
                </th>
                <th className="border px-2 py-1 sm:w-64">Quantité</th>
                {/* <th className="border px-2 py-1">Unité</th> */}
                <th
                  className="border px-2 py-1 cursor-pointer select-none sm:w-48"
                  onClick={() => handleSort("expiry")} // Utilisation de expiry pour trier par date d'expiration
                >
                  Péremption
                  {sortColumn === "expiry" && (sortOrder === "asc" ? " ▲" : " ▼")}
                </th>
              </tr>

            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="4" className="text-center">Chargement...</td>
                </tr>
              )}

              {!loading && filteredIngredients.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center">Aucun ingrédient</td>
                </tr>
              )}

              {!loading && paginatedIngredients.map((ing, idx) => {
                const status = getExpirationStatus(ing.expiry);

                return (
                  <tr key={idx}>
                    <td className="border px-2 py-1 w-16 text-center align-middle">
                      <img
                        src={`${CLOUDINARY_RES}${ing.picture || CLOUDINARY_RECETTE_NOTFOUND}`}
                        alt={ing.ingredient_name}
                        className={`w-10 h-10 object-cover mx-auto ${ing.recipe_id ? "rounded-2xl" : ""}`}
                      />
                    </td>
                    <td
                      className="border px-2 py-1 cursor-pointer text-blue-700 hover:underline"
                      onClick={() => {
                        setEditProduct(ing);   // on passe l’ingrédient entier
                        setShowModal(true);
                      }}
                    >
                    {ing.ingredient_name}
                  </td>

                  <td className="border px-2 py-1">
                    <DisplayIngredient ing={ing} />
                  </td>

                    {/* <td className="border px-2 py-1">{ing.unit_name}</td> */}
                    <td
                      className={`border px-2 py-1
                        ${status === "expired" ? "text-red-600 font-semibold" : ""}
                        ${status === "soon" ? "text-orange-500 font-semibold" : ""}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center">
                        <span>{formatDate(ing.expiry)}</span>

                        <span
                          className={`
                            ${status === "expired" ? "text-red-600" : ""}
                            ${status === "soon" ? "text-orange-500" : ""}
                            md:ml-2
                          `}
                        >
                          {(status === "expired" && "⚠️ Expiré") ||
                          (status === "soon" && "⏳ Bientôt")}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && totalPages > 1 && (
  <div className="flex justify-center items-center gap-4 mt-4">

    <button
      className="px-3 py-1 border rounded disabled:opacity-50"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(p => p - 1)}
    >
      ◀ Précédent
    </button>

    <span className="text-sm">
      Page {currentPage} / {totalPages}
    </span>

    <button
      className="px-3 py-1 border rounded disabled:opacity-50"
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage(p => p + 1)}
    >
      Suivant ▶
    </button>

  </div>
)}


        </div>
      </div>

    {showModal && editProduct && (
      <ModalProducts
        mode="edit"
        open={showModal}
        homeId={homeId}
        manualLock={true}   // en modification → on bloque nom/marque/unité si tu veux
        initialProduct={{
          id: editProduct.id,
          name: editProduct.ingredient_name,
          brand: editProduct.brand || "",
          quantity: editProduct.amount,
          unit: editProduct.unit_name,
          quantity_item: editProduct.amount_item || "",
          unit_item: editProduct.unit_item_name || "",
          expiry: editProduct.expiry,
          homeId: homeId,
          stock_id: editProduct.stock_id,
          ing_id: editProduct.ing_id,
          unit_id: editProduct.unit_id,
          unit_item_id: editProduct.unit_item_id,
          storage: storages.find(s => s.id === editProduct.stock_id) || null
        }}
        onDelete={deleteProduct}
        onClose={() => setShowModal(false)}
        onSave={handleUpdateProduct}
      />
    )}

    </div>
  );
}
