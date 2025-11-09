import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * GET /api/menus?homeId=1
 * Renvoie tous les menus pour un home donné,
 * avec leurs tags et recettes associées.
 */
router.get("/get-byHome", async (req, res) => {
  const { homeId } = req.query;

  if (!homeId) {
    return res.status(400).json({ error: "homeId est requis" });
  }

  try {
    // 🔹 Récupère tous les menus pour ce home
    const { rows: menus } = await pool.query(
      `SELECT id, datetime, tag_id, home_id 
       FROM "Menu" 
       WHERE home_id = $1
       ORDER BY datetime ASC`,
      [homeId]
    );

    // 🔹 Pour chaque menu, récupère tag et recettes
    const menusWithDetails = await Promise.all(
      menus.map(async (menu) => {
        // tag
        const { rows: tagRows } = await pool.query(
          `SELECT id, name FROM "Tag" WHERE id = $1`,
          [menu.tag_id]
        );
        const tag = tagRows[0] || null;

        // recettes
        const { rows: recipeRows } = await pool.query(
          `SELECT r.id, r.name, r.time_prep, r.time_cook, r.portion, r.picture
           FROM "menus_recipes" a
           JOIN "Recipe" r ON r.id = a.recipe_id
           WHERE a.menu_id = $1`,
          [menu.id]
        );

        return {
          id: menu.id,
          date: menu.datetime,
          homeId: menu.home_id,
          tag,
          recipes: recipeRows,
        };
      })
    );

    res.json(menusWithDetails);
  } catch (err) {
    console.error("Erreur /api/menu/get-byHome:", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des menus" });
  }
});


// ------------------- CREATE / UPDATE MENU -------------------
router.post("/update-menu", async (req, res) => {
  const { date, recipeIds, tagId, homeId } = req.body;

  if (!date || !Array.isArray(recipeIds) || recipeIds.length === 0 || !tagId || !homeId) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  try {
    // 1️⃣ Supprime les doublons côté serveur
    const uniqueRecipeIds = [...new Set(recipeIds.map(Number))];

    // 2️⃣ Vérifie si le menu existe déjà pour cette date, home et tag
    const { rows } = await pool.query(
      `SELECT id FROM "Menu" WHERE datetime = $1 AND home_id = $2 AND tag_id = $3`,
      [date, homeId, tagId]
    );

    let menuId;
    if (rows.length > 0) {
      menuId = rows[0].id;

      // Supprime les anciennes associations de recettes pour ce menu
      await pool.query(`DELETE FROM "menus_recipes" WHERE menu_id = $1`, [menuId]);
    } else {
      // Crée le menu s'il n'existe pas
      const result = await pool.query(
        `INSERT INTO "Menu" (datetime, home_id, tag_id) VALUES ($1, $2, $3) RETURNING id`,
        [date, homeId, tagId]
      );
      menuId = result.rows[0].id;
    }

    // 3️⃣ Insère toutes les recettes uniques avec ON CONFLICT
    if (uniqueRecipeIds.length > 0) {
      const values = uniqueRecipeIds.map((rid) => `(${menuId}, ${rid})`).join(",");
      await pool.query(`
        INSERT INTO "menus_recipes" (menu_id, recipe_id)
        VALUES ${values}
        ON CONFLICT (menu_id, recipe_id) DO NOTHING
      `);
    }

    res.json({ success: true, menuId });
  } catch (err) {
    console.error("Erreur update-menu:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});






export default router;
