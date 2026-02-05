import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ------------------- GET PROFILE -------------------
router.get("/get/:profileId", async (req, res) => {
  try {
    const { profileId } = req.params;
    if (!profileId) return res.status(400).json({ error: "missing profileId" });

    const query = `
      SELECT id, username, name, avatar, role_id, home_id, phone, phone_check, pin
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

// ------------------- CREATE PROFILE -------------------
router.post("/create", async (req, res) => {
  try {
    const { username, password, name, avatar, home_id, role_id } = req.body;
    if (!username || !password || !name || !home_id) 
      return res.status(400).json({ error: "missing fields" });

    // créer le profil et récupérer l'id
    const profileResult = await pool.query(
      `INSERT INTO "Profile" (username, password, name, avatar, role_id, home_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [username, password, name, avatar || null, role_id || 1, home_id]
    );

    const newProfileId = profileResult.rows[0].id;

    // lier le profil à la maison
    await pool.query(
      "INSERT INTO homes_profiles (home_id, profile_id) VALUES ($1, $2)",
      [home_id, newProfileId]
    );

    res.json({ ok: true, profileId: newProfileId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ------------------- TRANSFERT PROFILE -------------------
router.post("/transfer", async (req, res) => {
  try {
    const { username, password, home_id } = req.body;

    if (!username || !password || !home_id) {
      return res.status(400).json({ ok: false, error: "missing field" });
    }

    // Vérifier si le profil existe
    const profileResult = await pool.query(
      `SELECT id FROM "Profile" WHERE username = $1 AND password = $2 LIMIT 1`,
      [username, password]
    );

    if (profileResult.rows.length === 0) {
      return res.json({ ok: false, error: "Profil introuvable" });
    }

    const profileId = profileResult.rows[0].id;

    // Vérifier si le profil est déjà lié au home
    const existsResult = await pool.query(
      "SELECT 1 FROM homes_profiles WHERE home_id = $1 AND profile_id = $2",
      [home_id, profileId]
    );

    if (existsResult.rows.length > 0) {
      return res.json({ ok: false, error: "Profil déjà lié à ce home" });
    }

    // Lier le profil au home
    await pool.query(
      "INSERT INTO homes_profiles (home_id, profile_id) VALUES ($1, $2)",
      [home_id, profileId]
    );

    res.json({ ok: true });

  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ------------------- UPDATE PROFILE -------------------
router.post("/update", async (req, res) => {
  try {
    const { profileId, name, username, avatar } = req.body;

    if (!profileId) {
      return res.status(400).json({ error: "missing profileId" });
    }

    const query = `
      UPDATE "Profile"
      SET
        name = COALESCE($2, name),
        username = COALESCE($3, username),
        avatar = COALESCE($4, avatar)
      WHERE id = $1
      RETURNING id, username, name, avatar
    `;

    const { rows } = await pool.query(query, [
      profileId,
      name || null,
      username || null,
      avatar || null,
    ]);

    if (!rows.length) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ ok: true, profile: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});







// -----------------------------------TODO----------------------------------------
router.post("/save-token", async (req, res) => {
  try {
    const { profileId, pushToken } = req.body;
    if (!profileId || !pushToken) return res.status(400).json({ error: "Missing fields" });

    await pool.query(
      `UPDATE "Profile" SET push_token = $1 WHERE id = $2`,
      [pushToken, profileId]
    );

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/remove-token", async (req, res) => {
  const { profileId } = req.body;
  if (!profileId) return res.status(400).json({ error: "profileId requis" });

  try {
    await pool.query(
      `UPDATE "Profile" SET push_token = NULL WHERE id = $1`,
      [profileId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// ------------------------------------------------------------------------------

export default router;
