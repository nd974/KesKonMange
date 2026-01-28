import express from "express";
import { pool } from "../db.js";
import * as UAParser from "ua-parser-js";

const router = express.Router();

import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

/* ============================
   Utils
============================ */
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Vérifie que la session existe encore
    const { rows } = await pool.query(`
      SELECT id FROM "Sessions"
      WHERE profile_id = $1 AND token = $2
    `, [decoded.profileId, token]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Session expired" });
    }

    req.profileId = decoded.profileId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};


const getDeviceName = (userAgent) => {
  const parser = new UAParser.UAParser(userAgent);
  const result = parser.getResult();

  const browser = result.browser.name || "Browser";
  const browserVersion = result.browser.version
    ? result.browser.version.split(".")[0]
    : "";

  const os = result.os.name || "OS";
  const osVersion = result.os.version || "";

  const deviceVendor = result.device.vendor;
  const deviceModel = result.device.model;
  const deviceType = result.device.type; // mobile | tablet | desktop | undefined

  // 🧠 Device label
  let deviceLabel = "";

  if (deviceVendor && deviceModel) {
    deviceLabel = `${deviceVendor} ${deviceModel}`;
  } else if (os === "Android") {
    deviceLabel = "Android device";
  } else if (os === "Windows") {
    deviceLabel = "Windows PC";
  } else if (os === "Mac OS") {
    deviceLabel = "Mac";
  } else if (os === "iOS") {
    deviceLabel = "iPhone / iPad";
  } else {
    deviceLabel = "Unknown device";
  }

  // 🚨 Heuristique émulateur (soft)
  const isProbablyEmulator =
    os === "Android" &&
    parseInt(osVersion, 10) <= 7 &&
    parseInt(browserVersion, 10) >= 120;

  const emulatorSuffix = isProbablyEmulator ? " (simulated)" : "";

  return `· ${deviceLabel} · ${os} ${osVersion}${emulatorSuffix}`;
};

/* ============================
   POST → créer une session
   (appelé au login)
============================ */

router.post("/create", async (req, res) => {
  try {
    const { profileId } = req.body;
    if (!profileId) {
      return res.status(400).json({ error: "missing profileId" });
    }

    const userAgent = req.headers["user-agent"] || "Unknown";
    const deviceName = getDeviceName(userAgent);
    const ipAddress = req.ip;

    // 🔍 Vérifie si une session existe déjà pour ce device
    const { rows: existing } = await pool.query(`
      SELECT id, token
      FROM "Sessions"
      WHERE profile_id = $1
        AND user_agent = $2
        AND ip_address = $3
      LIMIT 1
    `, [profileId, userAgent, ipAddress]);

    // 🔁 SESSION EXISTANTE → reposer le cookie
    if (existing.length > 0) {
      const existingToken = existing[0].token;

      // Met à jour l'activité
      await pool.query(`
        UPDATE "Sessions"
        SET last_activity = NOW()
        WHERE id = $1
      `, [existing[0].id]);

      res.cookie("token", existingToken, {
        httpOnly: true,
        maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV !== "localhost" ? "none" : "lax",
        secure: process.env.NODE_ENV !== "localhost",
      });

      return res.json({
        success: true,
        sessionId: existing[0].id,
        reused: true,
      });
    }

    // 🆕 SINON → créer une nouvelle session
    const token = jwt.sign({ profileId }, JWT_SECRET, { expiresIn: "10y" });

    const { rows } = await pool.query(`
      INSERT INTO "Sessions" (
        profile_id, device_name, user_agent, ip_address, token
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, device_name, created_at
    `, [profileId, deviceName, userAgent, ipAddress, token]);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV !== "localhost" ? "none" : "lax",
      secure: process.env.NODE_ENV !== "localhost",
    });

    res.json({
      success: true,
      session: rows[0],
      reused: false,
    });

  } catch (err) {
    console.error("Erreur /sessions-create:", err.message);
    res.status(500).json({ error: err.message });
  }
});






/* ============================
   GET → sessions d’un profile
============================ */

router.get("/get/:profileId", authMiddleware, async (req, res) => {
  try {
    const { profileId } = req.params;
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!profileId) return res.status(400).json({ error: "missing profileId" });

    // Vérifie que la session du token existe encore
    const { rows: tokenRows } = await pool.query(`
      SELECT id FROM "Sessions"
      WHERE profile_id = $1 AND token = $2
    `, [profileId, token]);

    if (tokenRows.length === 0) {
      return res.status(401).json({ error: "Session expired" });
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

/* ============================
   PUT → modifier une session
============================ */

router.put("/update/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { deviceName } = req.body; // tu peux ajouter d'autres champs si besoin

    if (!sessionId) return res.status(400).json({ error: "missing sessionId" });
    if (!deviceName) return res.status(400).json({ error: "missing deviceName" });

    const { rows } = await pool.query(`
      UPDATE "Sessions"
      SET device_name = $1
      WHERE id = $2
      RETURNING id, device_name, ip_address, last_activity, created_at
    `, [deviceName, sessionId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({ success: true, session: rows[0] });

  } catch (err) {
    console.error("Erreur /sessions-update:", err.message);
    res.status(500).json({ error: err.message });
  }
});


export default router;
