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

// ------------------- UPDATE PROFILE PIN -------------------
router.post("/update-pin", async (req, res) => {
  try {
    const { profileId, pin } = req.body;

    if (!profileId) {
      return res.status(400).json({ error: "missing profileId" });
    }

    // 🔐 Autoriser suppression du PIN
    if (pin === null || pin === "") {
      await pool.query(
        `UPDATE "Profile" SET pin = NULL WHERE id = $1`,
        [profileId]
      );

      return res.json({ ok: true, pin: null });
    }

    // 🔒 Validation PIN (6 chiffres)
    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        error: "PIN must be exactly 6 digits",
      });
    }

    const query = `
      UPDATE "Profile"
      SET pin = $2
      WHERE id = $1
      RETURNING id, pin
    `;

    const { rows } = await pool.query(query, [profileId, pin]);

    if (!rows.length) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      ok: true,
      profileId: rows[0].id,
      pin: rows[0].pin,
    });
  } catch (e) {
    console.error("UPDATE PIN ERROR:", e);
    res.status(500).json({ error: e.message });
  }
});

import cloudinary from "cloudinary";
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Vérifier l'usage (optionnel)
cloudinary.v2.api.usage((error, result) => {
  if (error) {
    console.error(error);
  } else {
    console.log("Usage actuel :", result);
  }
});

// 🔥 Endpoint pour supprimer un avatar
router.delete("/delete-avatar/:publicId", async (req, res) => {
  const { publicId } = req.params;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "not found") return res.status(404).send("Avatar not found");
    res.send({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Erreur serveur" });
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
