import express from "express";
import { pool } from "../db.js";
const router = express.Router();

/* ---------------------------------------------
   1️⃣  GET ALL ZONES  (types de zones)
--------------------------------------------- */
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

/* ---------------------------------------------
   2️⃣  GET ALL STORAGE TYPES (types de stockages)
--------------------------------------------- */
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

/* ---------------------------------------------
   3️⃣  SAVE zones + stockages pour une maison
--------------------------------------------- */
router.post("/save", async (req, res) => {
  try {
    const { home_id, items } = req.body;

    if (!home_id || !items) {
      return res.status(400).json({ error: "home_id ou items manquants" });
    }

    // Supprimer les anciens
    await pool.query(`DELETE FROM "homes_storages" WHERE home_id = $1`, [home_id]);

    for (let item of items) {
      // Trouver l'ID du type via son nom
      const { rows } = await pool.query(
        `SELECT id FROM "Storage" WHERE name = $1`,
        [item.name]
      );

      if (!rows.length) {
        console.log("⚠️ Storage introuvable :", item.name);
        continue;
      }

      const storageId = rows[0].id;

      await pool.query(
        `INSERT INTO "homes_storages" 
          (home_id, storage_id, x, y, w_units, h_units, color)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [home_id, storageId, item.x, item.y, item.w_units, item.h_units, item.color]
      );
    }

    res.json({ success: true, message: "Stockages et zones sauvegardés" });

  } catch (err) {
    console.error("❌ Erreur /storage/save:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ---------------------------------------------
   4️⃣  GET SVG (zones + stockages INSTANCES)
--------------------------------------------- */
router.get("/getSVG", async (req, res) => {
  try {
    const homeId = req.query.homeId;

    const { rows } = await pool.query(
      `SELECT 
          hs.id AS instance_id,
          hs.storage_id AS type_id,
          s.name AS name,
          s.parent_id,
          hs.x,
          hs.y,
          hs.w_units,
          hs.h_units,
          hs.color
       FROM "homes_storages" hs
       JOIN "Storage" s ON s.id = hs.storage_id
       WHERE hs.home_id = $1
       ORDER BY hs.id ASC`,
      [homeId]
    );

    // Séparer zones et stockages via parent_id du type
    const storages = rows.filter(r => r.parent_id !== null);
    const zones = rows.filter(r => r.parent_id === null);

    res.json({ storages, zones });

  } catch (err) {
    console.error("❌ Erreur /storage/getSVG:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ---------------------------------------------
   5️⃣  GET ALL INSTANCES POUR UNE MAISON
       (chaque Cave à vin, Frigo, etc séparée)
--------------------------------------------- */
router.get("/getHomeStorages", async (req, res) => {
  try {
    const { homeId } = req.query;

    const { rows } = await pool.query(`
      SELECT 
        hs.id AS instance_id,
        hs.storage_id AS type_id,
        hs.x, hs.y, hs.w_units, hs.h_units, hs.color,
        s.name,
        s.parent_id
      FROM homes_storages hs
      JOIN "Storage" s ON s.id = hs.storage_id
      WHERE hs.home_id = $1
      ORDER BY hs.id ASC
    `, [homeId]);

    res.json(rows);

  } catch (err) {
    console.error("❌ Erreur /storage/getHomeStorages:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


export default router;
