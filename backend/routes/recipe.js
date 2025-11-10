import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * GET /recipe/get-all
 * Récupère toutes les recettes avec leurs tags
 */
router.get("/get-all", async (req, res) => {
  try {
    // 🔹 Récupérer toutes les recettes
    const { rows: recipes } = await pool.query(`
      SELECT 
        id,
        name,
        time_prep,
        time_cook,
        time_rest,
        time_clean,
        portion,
        level,
        picture
      FROM "Recipe"
      ORDER BY name ASC
    `);

    // 🔹 Récupérer tous les tags liés
    const { rows: recipeTags } = await pool.query(`
      SELECT rt.recipe_id, t.id AS tag_id, t.name, t.parent_id
      FROM "recipes_tags" rt
      JOIN "Tag" t ON t.id = rt.tag_id
    `);

    // 🔹 Créer un map recipe_id => tags
    const tagsByRecipe = {};
    for (const t of recipeTags) {
      if (!tagsByRecipe[t.recipe_id]) tagsByRecipe[t.recipe_id] = [];
      // 🔹 Ne pas ajouter de tag null
      if (t.tag_id && t.name) {
        tagsByRecipe[t.recipe_id].push({
          id: t.tag_id,
          name: t.name,
          parent_id: t.parent_id,
        });
      }
    }

    // 🔹 Ajouter les tags à chaque recette
    const recipesWithTags = recipes.map((r) => ({
      ...r,
      tags: tagsByRecipe[r.id] || [], // 🔹 tableau vide si pas de tags
    }));

    res.json(recipesWithTags);
  } catch (err) {
    console.error("Erreur /recipe/get-all:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/get-one/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const recipeRes = await pool.query(
      `SELECT id, name, time_prep, time_cook, time_rest, time_clean, portion, level, picture
       FROM "Recipe" WHERE id = $1`,
      [id]
    );

    if (recipeRes.rowCount === 0)
      return res.status(404).json({ error: "Recette introuvable" });

    const recipe = recipeRes.rows[0];

    const tagRes = await pool.query(
      `SELECT t.id, t.name, t.parent_id
       FROM "recipes_tags" rt
       JOIN "Tag" t ON t.id = rt.tag_id
       WHERE rt.recipe_id = $1`,
      [id]
    );

    recipe.tags = tagRes.rows || [];
    res.json(recipe);
  } catch (err) {
    console.error("Erreur /recipe/get-one:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
