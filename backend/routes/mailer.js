import express from "express";
import { pool } from "../db.js";

const router = express.Router();

const FRONT_URL = process.env.NODE_ENV === "PROD"
  ? process.env.VITE_API_URL
  : "http://localhost:5173";

router.get("/verify-email", async (req, res) => {

  try {
    const { token } = req.query;

    if (!token) {
      return res.redirect(`${FRONT_URL}/settings/security?verified=400`);
    }

    const { rows } = await pool.query(
      `
      SELECT id FROM "Home"
      WHERE email_verification_token = $1
        AND email_verification_expires > NOW()
      `,
      [token]
    );

    if (!rows.length) {
      return res.redirect(`${FRONT_URL}/settings/security?verified=410`);
    }

    await pool.query(
      `
      UPDATE "Home"
      SET email_check = true,
          email_verification_token = NULL,
          email_verification_expires = NULL
      WHERE id = $1
      `,
      [rows[0].id]
    );

    // 🔁 redirection front
    // res.redirect(`${process.env.FRONT_URL}/settings/security?verified=1`);
    res.redirect(`${FRONT_URL}/settings/security?verified=200`);
    
  } catch (e) {
    return res.redirect(`${FRONT_URL}/settings/security?verified=500`);
  }
});

export default router;