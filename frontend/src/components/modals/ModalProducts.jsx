import { useState, useEffect } from "react";
import HomeZone from "../HomeZone.jsx";
import {Unit_Item_List} from "../../config/constants.js";
import ModalWrapper from "./ModalWrapper";
import IngredientNameInput from "../IngredientNameInput";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ModalProducts({
  homeId,
  mode,
  open,
  initialStep = 1,
  initialProduct,
  manualLock,   // <-- AJOUT ICI
  onDelete,
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

  const [units, setUnits] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/unit/get-all`)
      .then(res => res.json())
      .then(data => setUnits(data))
      .catch(err => console.error("Erreur chargement unités:", err));
  }, []);

  useEffect(() => {
    if (!units.length) return;
    if (!form.unit || form.unit_id) return;

    const found = units.find(
      (u) => u.abbreviation.toLowerCase() === form.unit.toLowerCase()
    );

    if (found) {
      setForm((prev) => ({
        ...prev,
        unit_id: found.id,
        unit: found.abbreviation,
      }));
    }
  }, [units, form.unit, form.unit_id]);
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
  setStep(initialStep || 1);
}, [open, initialStep, initialProduct]);


// console.log("ModalProducts [form]", form);



  // ----------------------------
  // HANDLERS
  // ----------------------------
  const [isValidSuggestion, setIsValidSuggestion] = useState(false);
  const isStep1Valid = async() => {
    if (form.unit_item) {
      if (!form.quantity_item || Number(form.quantity_item) <= 0) {
        return false;
      }
    }
    if (form.name == "" || !form.quantity || Number(form.quantity) <= 0) {
      return false;
    }
      // ⚠️ Vérifie suggestion si pas de manuelLock
    if (!manualLock && !isValidSuggestion) {
        const result = await Swal.fire({
          title: "⚠️ Attention",
          html: `
          Le nom du produit n'est pas une suggestion sélectionnée.<br>
          Voulez-vous continuer quand même ?<br>
          Il faudra que le produit soit utilisé tel quel dans la recette et pas sous un autre nom.
          `,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Oui",
          cancelButtonText: "Non",
        });

        if (!result.isConfirmed) return; // Stoppe si annule
        setIsValidSuggestion(true); // Passe à true si confirmé
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

  const handleDelete = async () => {
    await onDelete(form.id);
    onClose();
  };

  if (!open) return null;

  return (
    <ModalWrapper onClose={onClose}>

        {/* ----------------------- */}
        {/* STEP 1 : INFOS PRODUIT */}
        {/* ----------------------- */}
        {step === 1 && (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-center text-accentGreen">
              Informations du produit
            </h2>

            {/* Nom */}
            <div className="mb-1">
            <label className="block text-sm font-medium mb-1">
              Nom du produit<span className="text-red-500"><b>*</b></span>
            </label>
            {/* <input
                type="text"
                value={form.name}
                disabled={manualLock} 
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full p-2 border rounded ${
                manualLock ? "bg-gray-100 text-gray-500" : ""
                }`}
            /> */}
            </div>
            <IngredientNameInput
              value={form.name}
              disabled={manualLock} 
              onChange={(value) => {
                setForm({ ...form, name: value})
                setIsValidSuggestion(false);
              }}
              onSelect={(suggestion) => {
                setForm({ ...form, name: suggestion })
                setIsValidSuggestion(true);
              }}
              showWarning={false}
            />

            {/* Marque */}
            {manualLock && (
              <div className="mt-4">
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
            )}


            {/* Quantité (toujours editable) */}
            <div className="mt-4 mb-4">
            <label className="block text-sm font-medium mb-1">
              Quantité<span className="text-red-500"><b>*</b></span>
            </label>
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
             <select
                value={form.unit_id || ""}
                onChange={(e) => setForm({ ...form, unit_id: Number(e.target.value), unit: e.target.selectedOptions[0].text })}
                disabled={manualLock}
                className={`w-full p-2 border rounded ${manualLock ? "bg-gray-100 text-gray-500" : ""}`}
              >
                <option value="">-</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>

            {Unit_Item_List.includes(form.unit) && (
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
            {Unit_Item_List.includes(form.unit) && (
              <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Unité Item</label>
              <select
                  value={form.unit_item_id || ""}
                  onChange={(e) => setForm({ ...form, unit_item_id: e.target.value, unit_item: e.target.selectedOptions[0].text })}
                  disabled={manualLock}
                  className={`w-full p-2 border rounded ${manualLock ? "bg-gray-100 text-gray-500" : ""}`}
                >
                  <option value="">-</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ---- BOUTON SUPPRIMER (uniquement en édition) ---- */}
            <div className="flex gap-2 mt-2 py-2 justify-center">
              {form.id && (
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white p-2 rounded w-1/2"
                >
                  🗑️ Supprimer
                </button>
              )}

              <button
                // disabled={form.name && form.quantity && Number(form.quantity) > 0}
                className={`p-2 rounded text-white ${
                  form.name && form.quantity && Number(form.quantity) > 0
                    ? "bg-green-600"
                    : "bg-gray-400"
                } ${form.id ? "w-1/2" : "w-full"}`}
                onClick={async () => {
                  // ⚠️ On attend le résultat de la validation
                  const valid = await isStep1Valid();
                  if (!valid) return; // Stop si annule
                  setStep(2); // Passe à l'étape 2 seulement si valide
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
    <h2 className="text-xl font-semibold mb-4 text-center text-accentGreen">
      Date de péremption
    </h2>

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
  <div>
    <h2 className="text-xl font-semibold mb-4 text-center text-accentGreen">
      Choisir le stockage
    </h2>

    <HomeZone
      key={homeId}
      homeId={homeId}
      onSelectZone={() => {}}
      onSelectStorage={(storage) => {
        setSelectedStorage(storage);
        setForm({ ...form, stock_id: storage.id });
        setStep(4);
      }}
      inPopinStorageSelect={form.stock_id}
    />

    <button
      className="mt-4 w-full bg-green-600 flex items-center justify-center gap-2 text-gray-700 hover:text-black p-2 rounded border"
      onClick={() => setStep(2)}
    >
      ← Retour
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
    </ModalWrapper>
  );
}
