import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ------------------- CREATE / UPDATE MENU -------------------
router.post("/update-menu", async (req, res) => {
  try {
    const { date, recipeIds, tagId, homeId } = req.body;

    if (!date || !recipeIds?.length || !tagId || !homeId) {
      return res.status(400).json({ error: "missing date, recipeIds, tagId or homeId" });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Vérifie si le menu existe
      const [rows] = await connection.query(
        `SELECT id FROM Menu WHERE DATE(datetime) = ? AND tag_id = ? AND home_id = ? LIMIT 1`,
        [date, tagId, homeId]
      );

      let menuId;
      if (rows.length) {
        menuId = rows[0].id;
      } else {
        const [result] = await connection.query(
          "INSERT INTO Menu (datetime, home_id, tag_id) VALUES (?, ?, ?)",
          [`${date} 00:00:00`, homeId, tagId]
        );
        menuId = result.insertId;
      }

      // Insert recipes
      for (const recipeId of recipeIds) {
        await connection.query(
          "INSERT IGNORE INTO A_menus_recipes (menu_id, recipe_id) VALUES (?, ?)",
          [menuId, recipeId]
        );
      }

      await connection.commit();
      res.json({ ok: true, menuId });
    } catch (err) {
      await connection.rollback();
      res.status(500).json({ error: err.message });
    } finally {
      connection.release();
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
