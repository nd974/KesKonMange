import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// 🔹 Route pour récupérer tous les ingrédients
router.get("/get-all", async (req, res) => {
  try {
    // Récupérer tous les ingrédients
    const { rows: ingredients } = await pool.query(`
      SELECT id, name
      FROM "Ingredient"
      ORDER BY name ASC
    `);

    res.json(ingredients);
  } catch (err) {
    console.error("Erreur /ingredient/get-all:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});



export default router;
