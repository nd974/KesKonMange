import { useState, useEffect } from "react";
import HomeZone from "./HomeZone";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ModalProducts({
  homeId,
  mode,
  open,
  initialProduct,
  manualLock,   // <-- AJOUT ICI
  onClose,
  onSave
}) {
  const [step, setStep] = useState(1); // 1 = infos / 2 = expiry / 3 = storage

  // ----------------------------
  // ETATS PRODUIT ÉDITABLES
  // ----------------------------
  const [form, setForm] = useState({
    name: "",
    brand: "",
    quantity: "",
    unit: "",
    quantity_item: "",
    unit_item: "",
    ean: "",
    expiry: "",
    stock_id: null,
    ing_id: null,
    unit_id: null,
    unit_item_id: null,
  });

  const [selectedStorage, setSelectedStorage] = useState(null);
//   const [expiry, setExpiry] = useState(initialProduct?.expiry || "");

  // ----------------------------
  // REMPLIR EN MODE ÉDITION
  // ----------------------------
useEffect(() => {
  if (!open) return;

  if (initialProduct) {
    // Formater la date en YYYY-MM-DD pour l'input date
    let formattedExpiry = "";
    if (initialProduct.expiry) {
      const d = new Date(initialProduct.expiry);
      formattedExpiry = d.toISOString().split("T")[0];
    }

    console.log("initialProduct.unit_item_id----------------------------", initialProduct.unit_item_id);
    setForm({
      id: initialProduct.id || "",
      name: initialProduct.name || "",
      ing_id: initialProduct.ing_id || null,
      brand: initialProduct.brand || "",
      quantity: initialProduct.quantity || "",
      unit: initialProduct.unit || "",
      unit_id: initialProduct.unit_id || null,
      quantity_item: initialProduct.quantity_item || "",
      unit_item: initialProduct.unit_item || "",
      unit_item_id: initialProduct.unit_item_id || null,
      expiry: formattedExpiry,
      stock_id: initialProduct.stock_id || null,
    });

    console.log("Initial product storage:", initialProduct);

    setSelectedStorage(initialProduct.storage || null);
  }

  setStep(1);
}, [open, initialProduct]);

// console.log("ModalProducts [form]", form);



  // ----------------------------
  // HANDLERS
  // ----------------------------
  const isStep1Valid = () => {
    if (form.unit_item) {
      if (!form.quantity_item || Number(form.quantity_item) <= 0) {
        return false;
      }
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      return false;
    }
    return true;
  };

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleSave = () => {
    onSave({
      ...form,
      storage: selectedStorage,
    });
    onClose();
  };

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-md relative">

        {/* ---- CLOSE BUTTON ---- */}
        <button
          className="absolute top-2 right-2 text-xl"
          onClick={onClose}
        >
          ✕
        </button>

        {/* ----------------------- */}
        {/* STEP 1 : INFOS PRODUIT */}
        {/* ----------------------- */}
        {step === 1 && (
        <div>

            <h2 className="text-xl font-bold mb-4 text-center">
            Informations du produit
            </h2>

            {/* Nom */}
            <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nom du produit</label>
            <input
                type="text"
                value={form.name}
                disabled={manualLock} 
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full p-2 border rounded ${
                manualLock ? "bg-gray-100 text-gray-500" : ""
                }`}
            />
            </div>

            {/* Marque */}
            <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Marque</label>
            <input
                type="text"
                value={form.brand}
                disabled={manualLock}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className={`w-full p-2 border rounded ${
                manualLock ? "bg-gray-100 text-gray-500" : ""
                }`}
            />
            </div>

            {/* Quantité (toujours editable) */}
            <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Quantité</label>
            <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full p-2 border rounded"
            />
            </div>

            {/* Unité */}
            <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Unité</label>
            <input
                type="text"
                value={form.unit}
                disabled={manualLock}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className={`w-full p-2 border rounded ${
                manualLock ? "bg-gray-100 text-gray-500" : ""
                }`}
            />
            </div>

            {form.unit_item && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Quantité Item</label>
                <input
                    type="number"
                    value={form.quantity_item}
                    min="0.01"
                    step="0.01"
                    onChange={(e) => setForm({ ...form, quantity_item: e.target.value })}
                    className="w-full p-2 border rounded"
                />
              </div>
            )}
            {form.unit_item && (
              <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Unité Item</label>
              <input
                  type="text"
                  value={form.unit_item}
                  disabled={manualLock}
                  onChange={(e) => setForm({ ...form, unit_item: e.target.value })}
                  className={`w-full p-2 border rounded ${
                  manualLock ? "bg-gray-100 text-gray-500" : ""
                  }`}
              />
              </div>
            )}

            {/* ---- BOUTON SUPPRIMER (uniquement en édition) ---- */}
            <div className="flex gap-2 mt-2 py-2 justify-center">
              {form.id && (
                <button
                  onClick={() => deleteProduct(form.id)}
                  className="bg-red-600 text-white p-2 rounded w-1/2"
                >
                  🗑️ Supprimer
                </button>
              )}

              <button
                disabled={!isStep1Valid()}
                className={`p-2 rounded text-white ${
                  isStep1Valid()
                    ? "bg-green-600"
                    : "bg-gray-400 cursor-not-allowed"
                } ${form.id ? "w-1/2" : "w-full"}`}
                onClick={() => {
                  if (!isStep1Valid()) return;
                  setStep(2);
                }}
              >
                Continuer →
              </button>

            </div>



        </div>
        )}



        {/* ----------------------- */}
        {/* STEP 2 : EXPIRATION     */}
        {/* ----------------------- */}
{step === 2 && (
  <div>
    <h2 className="text-xl font-bold mb-4 text-center">Date de péremption</h2>

    <input
      type="date"
      value={form.expiry || ""}
      onChange={(e) => setForm({ ...form, expiry: e.target.value })}
      className="w-full p-2 border rounded mb-4"
    />

    <button
    disabled={!form.expiry}
    className={`w-full p-2 rounded text-white ${
        form.expiry ? "bg-green-600" : "bg-gray-400"
    }`}
    onClick={() => setStep(3)}
    >
    Continuer →
    </button>

  </div>
)}


        {/* ----------------------- */}
        {/* STEP 3 : STOCKAGE       */}
        {/* ----------------------- */}
{step === 3 && (
  <div className="relative">
    <h2 className="text-xl font-bold mb-4 text-center">
      Choisir le stockage
    </h2>

    <HomeZone
      homeId={homeId}
      inPopin={true}
      onSelectZone={() => {}}
      onSelectStorage={(storage) => {
        setSelectedStorage(storage);
        setForm({ ...form, stock_id: storage.id });
        setStep(4); // ➜ passer à l'étape finale
      }}
      inPopinStorageSelect={form.stock_id}
    />

    <button
      className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl"
      onClick={() => setStep(2)}
    >
      ✕
    </button>
  </div>
)}

        {/* ----------------------- */}
        {/* STEP 4 : CONFIRMATION   */}
        {/* ----------------------- */}
        {step === 4 && (
        <div>
            <h2 className="text-xl font-bold mb-4 text-center">
            Confirmer le produit
            </h2>

            <ul className="text-sm mb-4 space-y-1">
            <li><strong>Nom :</strong> {form.name}</li>
            <li><strong>Marque :</strong> {form.brand}</li>
            <li><strong>Quantité :</strong> {form.quantity}</li>
            <li><strong>Unité :</strong> {form.unit}</li>
            <li><strong>Date :</strong> {form.expiry}</li>
            <li><strong>Stockage :</strong> {selectedStorage?.name}</li>
            </ul>

            <button
            className="bg-green-600 text-white p-2 rounded w-full"
            onClick={() => onSave(form)}
            >
            {mode === "edit" ? "💾 Sauvegarder" : "➕ Ajouter le produit"}
            </button>
        </div>
        )}


      </div>
    </div>
  );
}
