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
      SELECT id, name, abbreviation
      FROM "Unit"
    `);

    const units = rows.map(u => ({
      id: u.id,
      name: u.name,
      abbreviation: u.abbreviation
    }));

    res.json(units);
  } catch (err) {
    console.error("Erreur /unit/get-all:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;