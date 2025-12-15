import React, { useState } from "react";

export default function ModalInputData({ onClose, onSave }) {
  const [inputData, setInputData] = useState(""); // Champ pour entrer les données nutritionnelles
  const [parsedData, setParsedData] = useState([]);

  // Fonction pour analyser et parser les données
  const parseNutritionData = (text) => {
    const lines = text.split('\n');
    const data = [];
    let currentGroup = null;

    lines.forEach((line) => {
      const [nutrient, value] = line.trim().split(/\s{2,}/); // Séparation par 2 espaces
      if (nutrient && value) {
        data.push({ nutrient, value });
      }
    });

    return data;
  };

  // Fonction pour soumettre les données
  const handleSubmit = () => {
    const data = parseNutritionData(inputData);
    setParsedData(data); // Mettez à jour l'état avec les données extraites
    onSave(data); // Passer les données au parent (ModalNutrition)
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-96">
        <h2 className="text-xl font-semibold text-black text-center">
          🍏 Entrer les données nutritionnelles
        </h2>

        {/* Champ pour entrer les données nutritionnelles manuellement */}
        <textarea
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          placeholder="Collez ici vos données nutritionnelles..."
          className="w-full p-2 border border-gray-300 rounded mb-4"
          rows={6}
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Analyser
        </button>

        {/* Bouton pour fermer la modal */}
        <div className="flex justify-center mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
