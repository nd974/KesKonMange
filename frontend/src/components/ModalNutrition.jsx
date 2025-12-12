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
          Informations nutritionnelles
        </h2>

        <input
          className="w-full mb-3 p-2 border rounded text-black"
          placeholder="Quantité"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
        />
        <input
          className="w-full mb-3 p-2 border rounded text-black"
          placeholder="Unité (g, ml, etc.)"
          name="unit"
          value={formData.unit}
          onChange={handleChange}
        />
        <input
          className="w-full mb-3 p-2 border rounded text-black"
          placeholder="Protéines (g)"
          name="proteines"
          value={formData.proteines}
          onChange={handleChange}
        />
        <input
          className="w-full mb-3 p-2 border rounded text-black"
          placeholder="Lipides (g)"
          name="lipides"
          value={formData.lipides}
          onChange={handleChange}
        />
        <input
          className="w-full mb-3 p-2 border rounded text-black"
          placeholder="Glucides (g)"
          name="glucides"
          value={formData.glucides}
          onChange={handleChange}
        />
        <input
          className="w-full mb-3 p-2 border rounded text-black"
          placeholder="Fibres (g)"
          name="fibres"
          value={formData.fibres}
          onChange={handleChange}
        />
        <input
          className="w-full mb-3 p-2 border rounded text-black"
          placeholder="Sucres (g)"
          name="sucres"
          value={formData.sucres}
          onChange={handleChange}
        />
        <input
          className="w-full mb-5 p-2 border rounded text-black"
          placeholder="Sodium (mg)"
          name="sodium"
          value={formData.sodium}
          onChange={handleChange}
        />

        <div className="flex justify-between">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-6 py-2 rounded"
          >
            Sauvegarder
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 rounded"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
