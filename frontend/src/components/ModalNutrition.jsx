import React, { useState, useEffect } from "react";

export default function ModalNutrition({ ing_id, onClose }) {
  console.log("ModalNutrition ouverte pour ing_id:", ing_id);

  const [formData, setFormData] = useState({
    amount: "",
    unit: "",
    proteines: "",
    lipides: "",
    glucides: "",
    fibres: "",
    sucres: "",
    sodium: "",
  });

  // Charger les données de l'ingrédient si ing_id change
  useEffect(() => {
    if (ing_id) {
      // Ici tu peux récupérer les données via une API ou depuis ton parent
      console.log("Chargement des données pour l'ingrédient", ing_id);

      // Exemple : pré-remplissage (à adapter selon ton modèle de données)
      setFormData({
        amount: "50",
        unit: "g",
        proteines: "5",
        lipides: "3",
        glucides: "20",
        fibres: "2",
        sucres: "5",
        sodium: "100",
      });
    }
  }, [ing_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log("Données sauvegardées pour ing_id", ing_id, formData);
    onClose(); // Ferme la modal après sauvegarde
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-80">
        <h2 className="text-xl font-semibold mb-4 text-black text-center">
          🍏 Valeurs nutritionnelles
        </h2>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-black mb-2" htmlFor="amount">
              Quantité
            </label>
            <input
              className="w-full p-2 border rounded text-black"
              placeholder="Quantité"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              id="amount"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-black mb-2" htmlFor="unit">
              Unité
            </label>
            <input
              className="w-full p-2 border rounded text-black"
              placeholder="Unité (g, ml, ...)"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              id="unit"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2" htmlFor="proteines">
            Protéines (g)
          </label>
          <input
            className="w-full p-2 border rounded text-black"
            placeholder="Protéines (g)"
            name="proteines"
            value={formData.proteines}
            onChange={handleChange}
            id="proteines"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2" htmlFor="lipides">
            Lipides (g)
          </label>
          <input
            className="w-full p-2 border rounded text-black"
            placeholder="Lipides (g)"
            name="lipides"
            value={formData.lipides}
            onChange={handleChange}
            id="lipides"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2" htmlFor="glucides">
            Glucides (g)
          </label>
          <input
            className="w-full p-2 border rounded text-black"
            placeholder="Glucides (g)"
            name="glucides"
            value={formData.glucides}
            onChange={handleChange}
            id="glucides"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2" htmlFor="fibres">
            Fibres (g)
          </label>
          <input
            className="w-full p-2 border rounded text-black"
            placeholder="Fibres (g)"
            name="fibres"
            value={formData.fibres}
            onChange={handleChange}
            id="fibres"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2" htmlFor="sucres">
            Sucres (g)
          </label>
          <input
            className="w-full p-2 border rounded text-black"
            placeholder="Sucres (g)"
            name="sucres"
            value={formData.sucres}
            onChange={handleChange}
            id="sucres"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-black mb-2" htmlFor="sodium">
            Sodium (mg)
          </label>
          <input
            className="w-full p-2 border rounded text-black"
            placeholder="Sodium (mg)"
            name="sodium"
            value={formData.sodium}
            onChange={handleChange}
            id="sodium"
          />
        </div>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 rounded"
          >
            Fermer
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-6 py-2 rounded"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
