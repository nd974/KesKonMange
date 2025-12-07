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
  const client = await pool.connect();
  try {
    const { home_id, items } = req.body;

    console.log("SAVE zones + stockages pour home_id :", home_id);
    console.log("Items to save:", items);


    if (!home_id || !items) {
      return res.status(400).json({ error: "home_id ou items manquants" });
    }

    await client.query("BEGIN");

    // 1️⃣ Charger anciens stockages AVANT suppression
    const { rows: oldRows } = await client.query(
      `SELECT id, storage_id FROM homes_storages WHERE home_id = $1`,
      [home_id]
    );

    // 2️⃣ Réinsérer les nouvelles lignes et mémoriser premier nouvel ID par storage_id
    const newIdsByStorage = {}; // storage_id -> premier nouvel ID
    for (let item of items) {
      const insert = await client.query(
        `INSERT INTO homes_storages
          (home_id, storage_id, x, y, w_units, h_units, color)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING id`,
        [
          home_id,
          item.storage_id,
          item.x,
          item.y,
          item.w_units,
          item.h_units,
          item.color,
        ]
      );

      const newId = insert.rows[0].id;
      if (!newIdsByStorage[item.storage_id]) {
        newIdsByStorage[item.storage_id] = newId;
      }
    }

    // 3️⃣ Mettre à jour tous les produits qui pointent vers les anciens IDs
    for (let old of oldRows) {
      const newId = newIdsByStorage[old.storage_id];
      if (newId) {
        await client.query(
          `UPDATE "Product" SET stock_id = $1 WHERE stock_id = $2`,
          [newId, old.id]
        );
      } else {
        await client.query(
          `UPDATE "Product" SET stock_id = NULL WHERE stock_id = $1`,
          [old.id]
        );
      }
    }

    // 4️⃣ Supprimer les anciennes lignes
    const allOldIds = oldRows.map(r => r.id);
    if (allOldIds.length > 0) {
      await client.query(
        `DELETE FROM homes_storages WHERE id = ANY($1)`,
        [allOldIds]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Erreur /storage/save:", err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    client.release();
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
          hs.storage_id AS storage_id,
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


export default router;
