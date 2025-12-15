import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET → tous les nutriments
router.get("/nutrients-all", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        n.id AS nutrient_id,
        n.code AS nutrient_key,
        n.label AS nutrient_label,
        n.nutrition_id AS nutrition_id,
        g.label AS group_label,
        g.id AS group_id
      FROM "Nutrient" n
      JOIN "Nutrition" g ON n.nutrition_id = g.id
      ORDER BY g.id, n.id
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erreur /nutrients-all:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET → valeurs nutrition pour un ingrédient
router.get("/nutrition-get/:ingId", async (req, res) => {
  try {
    const { ingId } = req.params;
    if (!ingId) return res.status(400).json({ error: "missing ingId" });

    const { rows } = await pool.query(`
      SELECT
        n.code AS nutrient_key,
        n.label AS nutrient_label,
        i.value
      FROM "ingredients_nutrients" i
      JOIN "Nutrient" n ON n.id = i.nutrient_id
      WHERE i.ing_id = $1
      ORDER BY n.id
    `, [ingId]);

    res.json(rows);
  } catch (e) {
    console.error("nutrition-get error:", e);
    res.status(500).json({ error: e.message });
  }
});

// POST → sauvegarde nutrition
router.post("/nutrition-save/:ing_id", async (req, res) => {
  const ingId = Number(req.params.ing_id);
  const { nutrients } = req.body; // <- on envoie { nutrients: [...] }

  if (!Array.isArray(nutrients)) {
    return res.status(400).json({ error: "Payload nutrients doit être un tableau" });
  }

  try {
    // 1️⃣ récupérer tous les nutriments existants
    const { rows: allNutrients } = await pool.query(`
      SELECT id, code FROM "Nutrient"
    `);

    // 2️⃣ pour chaque nutriment reçu, insérer ou mettre à jour
    for (const n of nutrients) {
      const nutrient = allNutrients.find(nut => nut.code === n.nutrient_key);
      if (!nutrient) {
        console.warn("Nutriment inconnu:", n.nutrient_key);
        continue; // ignore les clés non existantes
      }

      await pool.query(`
        INSERT INTO ingredients_nutrients (ing_id, nutrient_id, value)
        VALUES ($1, $2, $3)
        ON CONFLICT (ing_id, nutrient_id)
        DO UPDATE SET value = EXCLUDED.value
      `, [ingId, nutrient.id, n.value]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur sauvegarde nutrition:", err);
    res.status(500).json({ error: "Erreur sauvegarde nutrition" });
  }
});

export default router;
