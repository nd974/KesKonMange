import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * GET /unit/get-all
 * Récupère tous les units
 */
router.get("/get-all", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, name, picture
      FROM "Utensil"
      ORDER BY name ASC
    `);

    const utensils = rows.map(u => ({
      id: u.id,
      name: u.name,
      picture: u.picture
    }));

    res.json(utensils);
  } catch (err) {
    console.error("Erreur /utensil/get-all:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;