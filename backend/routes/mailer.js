import express from "express";
import { pool } from "../db.js";

const router = express.Router();

const VITE_API_URL = process.env.VITE_API_URL || "http://localhost:5173";

router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("Token manquant");
    }

    const { rows } = await pool.query(
      `
      SELECT id FROM "Profile"
      WHERE email_verification_token = $1
        AND email_verification_expires > NOW()
      `,
      [token]
    );

    if (!rows.length) {
      return res.status(400).send("Lien invalide ou expiré");
    }

    await pool.query(
      `
      UPDATE "Profile"
      SET email_check = true,
          email_verification_token = NULL,
          email_verification_expires = NULL
      WHERE id = $1
      `,
      [rows[0].id]
    );

    // 🔁 redirection front
    // res.redirect(`${process.env.FRONT_URL}/settings/security?verified=1`);
    res.redirect(`${VITE_API_URL}/settings/security?verified=1`);
    
  } catch (e) {
    res.status(500).send("Erreur serveur");
  }
});

export default router;