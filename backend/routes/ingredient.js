import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// 🔹 Route pour récupérer tous les ingrédients
router.get("/get-all", async (req, res) => {
  try {
    // Récupérer tous les ingrédients
    const { rows: ingredients } = await pool.query(`
      SELECT id, name, recipe_id
      FROM "Ingredient"
      ORDER BY name ASC
    `);

    res.json(ingredients);
  } catch (err) {
    console.error("Erreur /ingredient/get-all:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Récupérer tous les prix des ingrédients pour un home donné
router.get("/get-price/:homeId", async (req, res) => {
  const { homeId } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT si.shop_id, si.ing_id, si.price, si.unit_id
      FROM shops_ingredients si
      INNER JOIN homes_shops hs ON si.shop_id = hs.id
      WHERE hs.home_id = $1
      ORDER BY si.ing_id, si.shop_id
      `,
      [homeId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Erreur /shops-ingredients/get-all:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/upsert", async (req, res) => {
  const items = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Payload invalide" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const item of items) {
      const { shop_id, ing_id, price, unit_id } = item;

      if (!shop_id || !ing_id || !unit_id || price == null) {
        throw new Error("Champs manquants");
      }

      await client.query(
        `
        INSERT INTO shops_ingredients (shop_id, ing_id, price, unit_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (shop_id, ing_id)
        DO UPDATE SET
          price = EXCLUDED.price,
          unit_id = EXCLUDED.unit_id
        `,
        [shop_id, ing_id, price, unit_id]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erreur /shops-ingredients/upsert:", err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    client.release();
  }
});

export default router;
