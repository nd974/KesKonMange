import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/*
Table: homes_shops
Columns:
id, home_id, shop_name, shop_lat, shop_long
*/

////////////////////////////////////////////////////////////
// GET ALL shops by home_id
////////////////////////////////////////////////////////////
router.get("/get-all/:homeId", async (req, res) => {
  const { homeId } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        id,
        home_id,
        shop_name,
        shop_lat,
        shop_long
      FROM homes_shops
      WHERE home_id = $1
      ORDER BY id DESC
      `,
      [homeId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Erreur GET /shops/:homeId", err.message);
    res.status(500).json({ error: err.message });
  }
});

////////////////////////////////////////////////////////////
// CREATE shop
////////////////////////////////////////////////////////////
router.post("/create", async (req, res) => {
  const { home_id, shop_name, shop_lat, shop_long } = req.body;

  if (!home_id || !shop_name || !shop_lat || !shop_long) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO homes_shops
      (home_id, shop_name, shop_lat, shop_long)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [home_id, shop_name, shop_lat, shop_long]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erreur POST /shops", err.message);
    res.status(500).json({ error: err.message });
  }
});

////////////////////////////////////////////////////////////
// UPDATE shop
////////////////////////////////////////////////////////////
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { shop_name, shop_lat, shop_long } = req.body;

  try {
    const { rows } = await pool.query(
      `
      UPDATE homes_shops
      SET
        shop_name = COALESCE($1, shop_name),
        shop_lat  = COALESCE($2, shop_lat),
        shop_long = COALESCE($3, shop_long)
      WHERE id = $4
      RETURNING *
      `,
      [shop_name, shop_lat, shop_long, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Shop introuvable" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erreur PUT /shops/:id", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM homes_shops WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
