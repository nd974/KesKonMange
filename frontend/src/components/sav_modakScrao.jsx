import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ModalNutrition({ ing_id, onClose }) {
  const [groups, setGroups] = useState([]);
  const [openGroups, setOpenGroups] = useState({});
  const [scrapUrl, setScrapUrl] = useState("");
  const [scrapping, setScrapping] = useState(false);

  // Fonction pour activer/désactiver la section du groupe
  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Mise à jour d'une valeur pour un enfant
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

  // Mise à jour de la valeur totale pour un groupe
  const handleTotalChange = (groupId, value) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id !== groupId
          ? group
          : { ...group, totalValue: value }
      )
    );
  };

  // Fonction de scraping des données
const handleScrap = async () => {
  if (!scrapUrl) return;
  setScrapping(true);

  try {
    const res = await fetch(`${API_URL}/nutrition/scrap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: scrapUrl }),
    });

    const scrapedData = await res.json();  // Données scrappées [{id: 'protéines', totalValue: 1.65, children: [...]}, ...]
    console.log("Données scrappées reçues:", scrapedData);

    // Fonction pour nettoyer et normaliser les noms
    const normalizeName = (name) => {
      return name
        .toLowerCase()                   // Convertir en minuscule
        .replace(/[^a-zA-Z0-9\s]/g, '')  // Enlever les caractères spéciaux
        .replace(/\s+/g, '_');           // Remplacer les espaces par des underscores
    };

    setGroups((prevGroups) => {
      return prevGroups.map((group) => {
        const groupNameNormalized = normalizeName(group.label); // Normaliser le nom du groupe de la modal
        console.log(`Traitement du groupe: ${group.label}, ID Normalisé: ${groupNameNormalized}`);

        // Chercher un groupe scrappé correspondant
        const scrapedGroup = scrapedData.find((data) => {
          const scrapedGroupNameNormalized = normalizeName(data.id);  // Normaliser le nom du groupe scrappé
          console.log(`Comparaison: ${groupNameNormalized} === ${scrapedGroupNameNormalized} ?`);
          return scrapedGroupNameNormalized === groupNameNormalized;  // Comparaison des noms normalisés
        });

        console.log(`Groupe trouvé dans les données scrappées ?`, scrapedGroup);

        // Si le groupe scrappé existe, on met à jour les valeurs
        if (scrapedGroup) {
          const updatedGroup = {
            ...group,
            totalValue: scrapedGroup.totalValue !== undefined ? scrapedGroup.totalValue : group.totalValue,
            children: group.children.map((child) => {
              // Chercher l'enfant dans les données scrappées
              const scrapedChild = scrapedGroup.children.find((scraped) => normalizeName(scraped.key) === normalizeName(child.key));
              return scrapedChild ? { ...child, value: scrapedChild.value } : child;
            }),
          };
          console.log("Groupe mis à jour:", updatedGroup);
          return updatedGroup;
        }

        // Si le groupe n'existe pas dans les données scrappées, on le garde tel quel
        console.log("Groupe non mis à jour, il n'existe pas dans les données scrappées.");
        return group;
      });
    });

  } catch (err) {
    console.error("Erreur lors du scraping:", err);
    alert("Impossible de récupérer les valeurs depuis l'URL.");
  } finally {
    setScrapping(false);
  }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-96">
        <h2 className="text-xl font-semibold text-black text-center">
          🍏 Valeurs nutritionnelles
        </h2>
        <p className="text-sm text-gray-600 mb-4 text-center">
          pour 100g
        </p>

        {/* Champ pour l'URL et bouton de scraping */}
        <div className="flex mt-2 gap-2">
          <input
            type="text"
            placeholder="URL du site à scrapper"
            className="flex-1 border rounded p-1"
            value={scrapUrl}
            onChange={(e) => setScrapUrl(e.target.value)}
          />
          <button
            className="bg-green-500 text-white px-4 py-1 rounded"
            onClick={handleScrap}
            disabled={scrapping}
          >
            {scrapping ? "Scrapping..." : "Scrapper"}
          </button>
        </div>

        {/* Tableau des valeurs nutritionnelles */}
<div className="max-h-[400px] overflow-y-auto border rounded mb-4">
<table className="w-full text-sm">
  <tbody>
    {groups.map((group) => {
      console.log(`Rendering group: ${group.label}, Total Value: ${group.totalValue}`);  // Log pour vérifier que les groupes sont bien à jour
      return (
        <React.Fragment key={`group_${group.id}`}>
          <tr
            className="bg-gray-200 cursor-pointer"
            onClick={() => toggleGroup(group.id)}
          >
            <td className="border px-2 py-1 font-semibold text-black flex justify-between items-center">
              <div className="flex items-center">
                <span className="inline-block w-4 text-center mr-2">
                  {openGroups[group.id] ? "▼" : "▶"}
                </span>
                <span>{group.label}</span>
              </div>
              {group.totalKey && (
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
              console.log(`Rendering child: ${child.label}, Value: ${child.value}`);  // Log des enfants
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
    </div>
  );
}
