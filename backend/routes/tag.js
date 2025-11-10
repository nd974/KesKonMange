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

/**
 * GET /tag/get-childs?parent=Repas
 * Renvoie les sous-tags du tag spécifié (par défaut "Repas")
 */
router.get("/get-childs", async (req, res) => {
  const parentName = req.query.parent || "Repas";

  try {
    // 🔹 Trouve le parent
    const { rows: parentRows } = await pool.query(
      `SELECT id FROM "Tag" WHERE name = $1 LIMIT 1`,
      [parentName]
    );

    if (!parentRows.length) {
      return res.json([]); // aucun tag parent trouvé
    }

    const parentId = parentRows[0].id;

    // 🔹 Récupère les enfants
    const { rows } = await pool.query(
      `SELECT id, name FROM "Tag" WHERE parent_id = $1 ORDER BY name`,
      [parentId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Erreur /tag/get-childs:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;