import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ------------------- GET ALL HOMES -------------------
// ------------------- GET ALL HOMES (WITH LINK INFO) -------------------
router.get("/get-all/:profileId", async (req, res) => {
  try {
    const { profileId } = req.params;
    if (!profileId) {
      return res.status(400).json({ error: "missing profileId" });
    }

    const query = `
      SELECT 
        h.id,
        h.name,
        h.email,
        CASE 
          WHEN hp.profile_id IS NOT NULL THEN true
          ELSE false
        END AS is_linked
      FROM "Home" h
      LEFT JOIN homes_profiles hp
        ON hp.home_id = h.id
        AND hp.profile_id = $1
      ORDER BY h.name ASC
    `;

    const { rows } = await pool.query(query, [profileId]);

    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ------------------- GET Home -------------------
router.get("/get/:homeId", async (req, res) => {
  try {
    const { homeId } = req.params;
    if (!homeId) return res.status(400).json({ error: "missing profileId" });

    const query = `
      SELECT id, email, password, name
      FROM "Home"
      WHERE id = $1
    `;

    const { rows } = await pool.query(query, [homeId]);
    
    if (!rows.length) {
      return res.status(404).json({ error: "Home not found" });
    }

    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

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

// ------------------- GET PROFILES FOR A HOME -------------------
router.get("/get-profiles", async (req, res) => {
  try {
    const homeId = req.query.homeId;
    if (!homeId) return res.status(400).json({ error: "missing homeId" });

    const result = await pool.query(
      `SELECT p.id, p.name, p.avatar, p.role_id, p.home_id
       FROM "Profile" p
       JOIN homes_profiles ahp ON ahp.profile_id = p.id
       WHERE ahp.home_id = $1
       ORDER BY p.role_id ASC, p.name ASC`, // Tri par role_id puis name
      [homeId]
    );

    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


export default router;
