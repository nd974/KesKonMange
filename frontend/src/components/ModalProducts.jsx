import { useState, useEffect } from "react";
import HomeZone from "./HomeZone";

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
    ean: "",
    expiry: "",
    stock_id: null,
    ing_id: null,
    unit_id: null,
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

    setForm({
      name: initialProduct.name || "",
      brand: initialProduct.brand || "",
      quantity: initialProduct.quantity || "",
      unit: initialProduct.unit || "",
      expiry: formattedExpiry,
      stock_id: initialProduct.stock_id || null,
      ing_id: initialProduct.ing_id || null,
      unit_id: initialProduct.unit_id || null,
    });

    setSelectedStorage(initialProduct.storage || null);
  }

  setStep(1);
}, [open, initialProduct]);



  // ----------------------------
  // HANDLERS
  // ----------------------------
  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleSave = () => {
    onSave({
      ...form,
      storage: selectedStorage,
    });
    onClose();
  };

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

            {/* Bouton Continuer */}
            <button
            className="bg-green-600 text-white p-2 rounded w-full mt-2"
            onClick={() => setStep(2)}
            >
            Continuer →
            </button>

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
