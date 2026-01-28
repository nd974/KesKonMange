import express from "express";
import { pool } from "../db.js";
import * as UAParser from "ua-parser-js";

const router = express.Router();

import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

/* ============================
   Utils
============================ */

const getDeviceName = (userAgent) => {
  const parser = new UAParser.UAParser(userAgent);
  const result = parser.getResult();

  const browser = result.browser.name || "Unknown Browser";
  const browserVersion = result.browser.version || "";
  const os = result.os.name || "Unknown OS";
  const osVersion = result.os.version || "";

  return `${browser} ${browserVersion} / ${os} ${osVersion}`;
};

/* ============================
   POST → créer une session
   (appelé au login)
============================ */
router.post("/create", async (req, res) => {
  try {
    const { profileId } = req.body;
    if (!profileId) return res.status(400).json({ error: "missing profileId" });

    const userAgent = req.headers["user-agent"] || "Unknown";
    const deviceName = getDeviceName(userAgent);
    const ipAddress = req.ip;

    // 🔹 Vérifier si une session existe déjà pour ce profil + device + userAgent
    const { rows: existingSessions } = await pool.query(
    `SELECT id, token FROM "Sessions" 
    WHERE profile_id = $1 AND ip_address = $2 AND user_agent = $3`,
    [profileId, ipAddress, userAgent]
    );

    let token;
    if (existingSessions.length > 0) {
      // Utiliser le token existant
      token = existingSessions[0].token;
    } else {
      // 🔐 créer un token JWT durable (par ex. 10 ans)
      token = jwt.sign({ profileId }, JWT_SECRET, { expiresIn: '10y' });

      // Créer la session
      await pool.query(`
        INSERT INTO "Sessions" (
          profile_id,
          device_name,
          user_agent,
          ip_address,
          token
        )
        VALUES ($1, $2, $3, $4, $5)
      `, [profileId, deviceName, userAgent, ipAddress, token]);
    }

    // 🔐 envoyer le token au client dans un cookie httpOnly
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000, // 10 ans
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    res.json({ success: true });

  } catch (err) {
    console.error("Erreur /sessions-create:", err.message);
    res.status(500).json({ error: err.message });
  }
});




/* ============================
   GET → sessions d’un profile
============================ */

router.get("/get/:profileId", async (req, res) => {
  try {
    const { profileId } = req.params;
    if (!profileId) {
      return res.status(400).json({ error: "missing profileId" });
    }

    const { rows } = await pool.query(`
      SELECT
        id,
        device_name,
        ip_address,
        last_activity,
        created_at
      FROM "Sessions"
      WHERE profile_id = $1
      ORDER BY last_activity DESC
    `, [profileId]);

    res.json(rows);

  } catch (err) {
    console.error("Erreur /sessions-profile:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   DELETE → supprimer une session
   (déconnexion forcée)
============================ */

router.delete("/delete/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: "missing sessionId" });
    }

    await pool.query(`
      DELETE FROM "Sessions"
      WHERE id = $1
    `, [sessionId]);

    res.json({ success: true });

  } catch (err) {
    console.error("Erreur /sessions-delete:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
