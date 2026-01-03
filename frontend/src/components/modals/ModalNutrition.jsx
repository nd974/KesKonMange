import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ModalNutrition({ ing_id, onClose }) {
  const [groups, setGroups] = useState([]);
  const [openGroups, setOpenGroups] = useState({});
  const [showInputModal, setShowInputModal] = useState(false); // Gérer l'affichage de la modal pour entrer les données
  const [inputData, setInputData] = useState(""); // Champ pour entrer les données nutritionnelles
  const [parsedData, setParsedData] = useState([]);

  // Fonction pour activer/désactiver la section du groupe
  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Charger les données nutritionnelles lors du montage du composant
  useEffect(() => {
    if (!ing_id) return;

    const fetchNutrition = async () => {
      try {
        const resAll = await fetch(`${API_URL}/nutrition/nutrients-all`);
        const allNutrients = await resAll.json();

        const resValues = await fetch(
          `${API_URL}/nutrition/nutrition-get/${ing_id}`
        );
        const values = (await resValues.json()) || [];

        const grouped = {};
        allNutrients.forEach((n) => {
          const groupId = n.group_id;
          if (!grouped[groupId]) {
            grouped[groupId] = {
              id: groupId,
              label: n.group_label,
              children: [],
              totalValue: 0, // total initialisé
              totalKey: "",  // pour stocker le code exact
            };
          }

          const nutrientKey = n.nutrient_key || `unknown_${n.nutrient_id}`;
          const nutrientValue = values.find((v) => v.nutrient_key === nutrientKey)?.value ?? 0;

          if (nutrientKey.startsWith("total_")) {
            grouped[groupId].totalValue = nutrientValue;
            grouped[groupId].totalKey = nutrientKey;
          } else {
            grouped[groupId].children.push({
              key: nutrientKey,
              label: n.nutrient_label,
              value: nutrientValue,
            });
          }
        });

        setGroups(Object.values(grouped));
      } catch (err) {
        console.error("Erreur fetch nutrition", err);
        setGroups([]);
      }
    };

    fetchNutrition();
  }, [ing_id]);

  // Sauvegarder les modifications
  const handleSave = async () => {
    try {
      const payload = groups.flatMap((group) => [
        ...group.children.map((c) => ({ nutrient_key: c.key, value: c.value })),
        group.totalKey ? { nutrient_key: group.totalKey, value: group.totalValue } : [],
      ]);

      await fetch(`${API_URL}/nutrition/nutrition-save/${ing_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nutrients: payload }),
      });

      alert("Valeurs nutritionnelles sauvegardées !");
      onClose();
    } catch (err) {
      console.error("Erreur sauvegarde nutrition", err);
      alert("Erreur lors de la sauvegarde des valeurs nutritionnelles.");
    }
  };

  // Fonction pour analyser et parser les données
const parseNutritionData = (text) => {
  // Diviser le texte par des sauts de ligne et nettoyer les espaces inutiles
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

  // Créer un tableau d'objets de type { nutrient, value }
  const data = [];

  // Expression régulière améliorée pour capturer les nutriments et leurs valeurs avec différentes unités
  const regex = /([a-zA-Z\s\(\)\-\,\.\d]+(?:\(\d+:\d+\)|ω?[0-9\-:]+)?)\s*(\d+(\.\d+)?\s?(g|mg|µg|kcal|kJ|NE|IU|%)?)/i;

  lines.forEach((line) => {
    const match = line.match(regex);

    if (match) {
      let nutrient = match[1].trim();  // Nom du nutriment
      let value = match[2]?.trim();     // Valeur et unité

      // Nettoyer les noms de nutriments si nécessaire (ex: retirer des chiffres à la fin des noms)
      if (nutrient.match(/\d+$/)) {
        nutrient = nutrient.replace(/\d+$/, '').trim();
      }

      // Vérifier que la valeur existe et qu'elle est bien formatée
      if (value) {
        // Ajouter un objet {nutrient, value} dans le tableau
        data.push({ nutrient, value });
      }
    }
  });

  // Filtrer les lignes inutiles comme "pour 100g" et autres annotations non nutritionnelles
  const filteredData = data.filter(item => !item.nutrient.toLowerCase().includes("pour"));

  console.log("Données analysées:", filteredData); // Afficher les données analysées dans les logs
  return filteredData;
};




  const handleTotalChange = (groupId, value) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id !== groupId ? group : { ...group, totalValue: value }
      )
    );
  };

  const handleChildChange = (groupId, childKey, value) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              children: group.children.map((child) =>
                child.key === childKey ? { ...child, value } : child
              ),
            }
      )
    );
  };

  // Fonction pour soumettre les données
  const handleSubmit = () => {
    const data = parseNutritionData(inputData);
    if (data.length > 0) {
      setParsedData(data); // Mettre à jour l'état avec les données extraites
      setShowInputModal(false); // Ferme la modal après l'enregistrement des données
      setInputData(""); // Réinitialise le champ de texte après soumission
    } else {
      alert("Aucune donnée valide n'a été trouvée.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-96">
        <h2 className="text-xl font-semibold text-black text-center">
          🍏 Valeurs nutritionnelles
        </h2>
        <p className="text-sm text-gray-600 mb-4 text-center">
          pour 100g
        </p>

        {/* Bouton pour ouvrir la modal d'entrée des données */}
        <div className="flex justify-center mb-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setShowInputModal(true)} // Ouvrir la modal d'entrée des données
          >
            Entrer les données nutritionnelles
          </button>
        </div>

        {/* Tableau des valeurs nutritionnelles */}
        <div className="max-h-[400px] overflow-y-auto border rounded mb-4">
          <table className="w-full text-sm">
            <tbody>
              {groups.map((group) => {
                return (
                  <React.Fragment key={`group_${group.id}`}>
                    <tr
                      className="bg-gray-200 cursor-pointer"
                      onClick={() => toggleGroup(group.id)}
                    >
                      <td className="border px-2 py-1 font-semibold text-black flex justify-between items-center">
                        <div className="flex items-center">
                          {group.children.length > 0 && (
                            <span className="inline-block w-4 text-center mr-2">
                              {openGroups[group.id] ? "▼" : "▶"}
                            </span>
                          )}
                          <span>{group.label}</span>
                        </div>
                        {group.totalKey && !["Vitamines", "Minéraux", "Autres constituants"].includes(group.label) &&(
                          <input
                            type="number"
                            className="w-16 p-1 border rounded text-black text-right bg-gray-200"
                            value={group.totalValue}
                            onChange={(e) =>
                              handleTotalChange(group.id, Number(e.target.value))
                            }
                          />
                        )}
                      </td>
                    </tr>

                    {openGroups[group.id] &&
                      group.children.map((child) => {
                        return (
                          <tr key={child.key}>
                            <td colSpan={2} className="border px-2 py-1 text-black">
                              <div className="grid grid-cols-3 items-center gap-2">
                                <div className="col-span-2 text-left">{child.label}</div>
                                <div className="col-span-1">
                                  <input
                                    type="number"
                                    className="w-full p-1 border rounded text-black"
                                    value={child.value}
                                    onChange={(e) =>
                                      handleChildChange(
                                        group.id,
                                        child.key,
                                        Number(e.target.value)
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Boutons de fermeture et de sauvegarde */}
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

      {/* Modal d'entrée des données nutritionnelles */}
      {showInputModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-96">
            <h2 className="text-xl font-semibold text-black text-center">
              🍏 Entrer les données nutritionnelles
            </h2>
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
            <button
              onClick={() => setShowInputModal(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded mt-4"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
