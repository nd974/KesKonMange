import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ------------------- CREATE HOME -------------------
router.post("/create", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "missing fields" });

    const result = await pool.query(
      "INSERT INTO Home (email, password, name) VALUES ($1, $2, $3) RETURNING id",
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
      "SELECT id FROM Home WHERE email = $1 AND password = $2 LIMIT 1",
      [email, password]
    );

    if (result.rows.length === 0) return res.json({ ok: false });

    res.json({ ok: true, homeId: result.rows[0].id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// ------------------- GET PROFILES FOR A HOME -------------------
router.get("/get-profiles", async (req, res) => {
  try {
    const homeId = req.query.homeId;
    if (!homeId) return res.status(400).json({ error: "missing homeId" });

    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.avatar
       FROM Profile p
       JOIN homes_profiles ahp ON ahp.profile_id = p.id
       WHERE ahp.home_id = ?`,
      [homeId]
    );

    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ------------------- CREATE PROFILE -------------------
router.post("/create-profile", async (req, res) => {
  try {
    const { username, password, name, avatar, home_id, role_id } = req.body;
    if (!username || !password || !name || !home_id) return res.status(400).json({ error: "missing fields" });

    const conn = await pool.getConnection();
    try {
      // créer le profil
      const [profileResult] = await conn.execute(
        "INSERT INTO Profile (username, password, name, avatar, role_id) VALUES ($1, $2, $3, $4, $5)",
        [username, password, name, avatar || null, role_id || 1]
      );

      const newProfileId = profileResult.insertId;

      // lier le profil à la maison
      await conn.execute(
        "INSERT INTO homes_profiles (home_id, profile_id) VALUES ($1, $2)",
        [home_id, newProfileId]
      );

      res.json({ ok: true, profileId: newProfileId });
    } finally {
      conn.release();
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
