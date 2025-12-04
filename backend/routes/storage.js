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

    // Fonction utilitaire pour convertir "null" ou undefined en vraie valeur null pour PostgreSQL
    const safeNumber = (value) => (value === null || value === "null" || value === undefined ? null : Number(value));

    // Liste des instances existantes
    const { rows: dbInstances } = await pool.query(
      `SELECT id, storage_id, x FROM homes_storages WHERE home_id=$1`,
      [home_id]
    );

    const instanceIdsSent = new Set(items.map(i => i.instance_id).filter(Boolean));
    const storageIdsSent = new Set(items.map(i => i.storage_id).filter(Boolean));

    // 1️⃣ INSERT / UPDATE
    for (let item of items) {
      if (item.instance_id) {
        // UPDATE
        await pool.query(
          `UPDATE homes_storages
           SET x=$2, y=$3, w_units=$4, h_units=$5, color=$6
           WHERE id=$1`,
          [
            item.instance_id,
            safeNumber(item.x),
            safeNumber(item.y),
            safeNumber(item.w_units),
            safeNumber(item.h_units),
            item.color
          ]
        );
      } else {
        // INSERT
        await pool.query(
          `INSERT INTO homes_storages
           (home_id, storage_id, x, y, w_units, h_units, color)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            home_id,
            item.storage_id || null,
            safeNumber(item.x),
            safeNumber(item.y),
            safeNumber(item.w_units),
            safeNumber(item.h_units),
            item.color
          ]
        );
      }
    }

    // 2️⃣ Gestion des placeholders pour les zones/storages qui n'ont plus d'instance active
    for (let db of dbInstances) {
      if (!instanceIdsSent.has(db.id)) {
        if (!storageIdsSent.has(db.storage_id)) {
          await pool.query(
            `UPDATE homes_storages
             SET x=NULL, y=NULL, w_units=NULL, h_units=NULL, color=NULL
             WHERE id=$1`,
            [db.id]
          );
          storageIdsSent.add(db.storage_id);
        }
      }
    }

    // 3️⃣ Nettoyage des doublons et des placeholders tout en gardant les produits
    await pool.query("BEGIN");
    try {
      const { rows: raw } = await pool.query(
        `SELECT id, storage_id, x FROM homes_storages WHERE home_id=$1`,
        [home_id]
      );

      // Grouper par storage_id
      const groups = {};
      for (let r of raw) {
        const key = r.storage_id ?? `instance_${r.id}`; // Les zones sans storage_id
        if (!groups[key]) groups[key] = [];
        groups[key].push(r);
      }

      for (let key in groups) {
        const list = groups[key];
        const active = list.filter(r => r.x !== null);
        const placeholders = list.filter(r => r.x === null);

        if (active.length >= 1) {
          const keep = active[0].id;
          for (let ph of placeholders) {
            await pool.query(`UPDATE "Product" SET stock_id=$1 WHERE stock_id=$2`, [keep, ph.id]);
            await pool.query(`DELETE FROM homes_storages WHERE id=$1`, [ph.id]);
          }
        } else if (placeholders.length > 1) {
          const keep = placeholders[0].id;
          const toDelete = placeholders.slice(1);
          for (let del of toDelete) {
            await pool.query(`UPDATE "Product" SET stock_id=$1 WHERE stock_id=$2`, [keep, del.id]);
            await pool.query(`DELETE FROM homes_storages WHERE id=$1`, [del.id]);
          }
        }
      }

      await pool.query("COMMIT");
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }

    res.json({ success: true });

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


export default router;
