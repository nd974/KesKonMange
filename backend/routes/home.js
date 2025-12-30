import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ------------------- CREATE HOME -------------------
router.post("/create", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "missing fields" });

    const result = await pool.query(
      `INSERT INTO "Home" (email, password, name) VALUES ($1, $2, $3) RETURNING id`,
      [email, password, name]
    );

    // Pour récupérer l'id inséré :
    const homeId = result.rows[0].id;

    res.json({ ok: true, homeId });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ------------------- LOGIN HOME -------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // PostgreSQL : pool.query() renvoie un objet { rows, rowCount, ... }
    const result = await pool.query(
      `SELECT id FROM "Home" WHERE email = $1 AND password = $2 LIMIT 1`,
      [email, password]
    );

    if (result.rows.length === 0) return res.json({ ok: false });

    res.json({ ok: true, homeId: result.rows[0].id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ------------------- GET HOMES (BY PROFILE) -------------------
router.get("/homes-get/:profileId", async (req, res) => {
  try {
    const { profileId } = req.params;
    if (!profileId) return res.status(400).json({ error: "missing profileId" });

    const query = `
      SELECT h.id, h.name, h.email
      FROM "Home" h
      JOIN homes_profiles hp ON hp.home_id = h.id
      WHERE hp.profile_id = $1
    `;

    const { rows } = await pool.query(query, [profileId]);

    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Récupérer un profil par son ID
router.get("/get/:profileId", async (req, res) => {
  try {
    const { profileId } = req.params;
    if (!profileId) return res.status(400).json({ error: "missing profileId" });

    const query = `
      SELECT id, username, name, avatar, role_id
      FROM "Profile"
      WHERE id = $1
    `;

    const { rows } = await pool.query(query, [profileId]);
    
    if (!rows.length) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


export default router;
