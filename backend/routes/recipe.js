import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * GET /recipe/get-all
 * Récupère toutes les recettes
 */
router.get("/get-all", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        id,
        name,
        time_prep,
        time_cook,
        portion,
        picture
      FROM "Recipe"
      ORDER BY name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erreur /recipe/get-all:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
