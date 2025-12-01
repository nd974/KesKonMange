import express from "express";
import { pool } from "../db.js";
const router = express.Router();

// Récupérer toutes les zones (parent_id = null)
router.get("/getAllZones", async (req, res) => { 
  try {
    const { rows } = await pool.query(`
      SELECT id, name
      FROM "Storage"
      WHERE parent_id IS NULL
      ORDER BY name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erreur /storage/zones:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer tous les stockages (parent_id != null)
router.get("/getAllStorages", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, name, parent_id
      FROM "Storage"
      WHERE parent_id IS NOT NULL
      ORDER BY name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erreur /storage/storages:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Sauvegarder le svg
router.post("/save", async (req, res) => {
  try {
    const { home_id, items } = req.body; 
    // items = [{ storage_id, x, y, w_units, h_units, color }]

    if (!home_id || !items) {
      return res.status(400).json({ error: "home_id ou items manquants" });
    }

    // Supprimer les anciens pour cette maison
    await pool.query(`DELETE FROM "homes_storages" WHERE home_id = $1`, [home_id]);

    for (let item of items) {
        // Vérifier si le storage existe dans la table Storage par son name
        const { rows } = await pool.query(
            `SELECT id FROM "Storage" WHERE name = $1`,
            [item.name]
        );

        console.log(item);

        if (!rows.length) {
            console.log("storage name inexistant, skipping:", item);
            continue;
        }

        const storageId = rows[0].id; // <-- THIS IS THE INTEGER

        // Insérer dans homes_storages
        await pool.query(
            `INSERT INTO "homes_storages" (home_id, storage_id, x, y, w_units, h_units, color)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [home_id, storageId, item.x, item.y, item.w_units, item.h_units, item.color]
        );
    }


    res.json({ success: true, message: "Stockages et zones sauvegardés" });
  } catch (err) {
    console.error("Erreur /storage/save:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});




// Sauvegarder les stockages d'une maison
// Récupérer les stockages et zones pour une maison (SVG)
router.get("/getSVG", async (req, res) => {
  try {
    const homeId = req.query.homeId;

    console.log("➡️ /getSVG called with homeId =", homeId);

    const { rows } = await pool.query(
      `SELECT 
          hs.storage_id AS id,
          s.name AS name,
          s.parent_id,
          hs.x,
          hs.y,
          hs.w_units,
          hs.h_units,
          hs.color
       FROM "homes_storages" hs
       JOIN "Storage" s ON s.id = hs.storage_id
       WHERE hs.home_id = $1`,
      [homeId]
    );

    console.log("➡️ /getSVG SQL RESULT =", rows);

    // Split rows into storages (parent_id != null) and zones (parent_id == null)
    const storages = rows.filter(r => r.parent_id !== null);
    const zones = rows.filter(r => r.parent_id === null);

    res.json({ storages, zones });
  } catch (err) {
    console.error("❌ Erreur /storage/getSVG:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});





export default router;
