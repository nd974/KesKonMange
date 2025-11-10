import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * GET /tag/get-all
 * Récupère tous les tags
 */
router.get("/get-all", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, name, parent_id
      FROM "Tag"
      ORDER BY name ASC
    `);

    const tags = rows.map(t => ({
      id: t.id,
      name: t.name,
      parent_id: t.parent_id
    }));

    res.json(tags);
  } catch (err) {
    console.error("Erreur /tag/get-all:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;