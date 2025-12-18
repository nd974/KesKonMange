import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ---------------------------
// CREATE PRODUCT
// ---------------------------
router.post("/create", async (req, res) => {
  try {
    const { ing_id, amount, unit_id, amount_item, unit_item_id, stock_id, expiry, homeId } = req.body;

    if (!amount || !stock_id || !expiry) {
      return res.status(400).json({ error: "missing fields" });
    }

    // Vérifier si un produit identique existe déjà (fusion seulement si ing_id + stock_id + expiry + amount_item + unit_item_id sont identiques)
    if (ing_id) {
      const existing = await pool.query(
        `SELECT id, amount 
         FROM "Product" 
         WHERE ing_id = $1 
           AND stock_id = $2 
           AND expiry = $3
           AND amount_item = $4
           AND unit_item_id = $5`,
        [ing_id, stock_id, expiry, amount_item || null, unit_item_id || null]
      );

      if (existing.rows.length > 0) {
        const existingProduct = existing.rows[0];
        const newAmount = Number(existingProduct.amount) + Number(amount);

        await pool.query(
          `UPDATE "Product" SET amount = $1 WHERE id = $2`,
          [newAmount, existingProduct.id]
        );

        return res.json({
          ok: true,
          merged: true,
          productId: existingProduct.id,
          newAmount
        });
      }
    }

    // Sinon insertion normale
    const insert = await pool.query(
      `INSERT INTO "Product" (ing_id, amount, unit_id, amount_item, unit_item_id, stock_id, expiry, home_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id`,
      [ing_id || null, amount, unit_id || null, amount_item || null, unit_item_id || null, stock_id, expiry, homeId]
    );

    res.json({ ok: true, merged: false, productId: insert.rows[0].id });

  } catch (e) {
    console.error("ERROR /product/create:", e);
    res.status(500).json({ error: e.message });
  }
});


// ---------------------------
// DEL PRODUCTS
// ---------------------------
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      `DELETE FROM "Product" WHERE id = $1`,
      [id]
    );

    return res.json({ ok: true, deletedId: id });
  } catch (e) {
    console.error("ERROR /product/delete:", e);
    return res.status(500).json({ error: e.message });
  }
});

// ---------------------------
// GET PRODUCTS
// ---------------------------
router.get("/getProducts/:homeId", async (req, res) => {
  const { homeId } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.id, p.ing_id, p.amount, p.unit_id, p.amount_item, p.unit_item_id, p.stock_id, p.expiry, p.home_id,
              i.name AS ingredient_name, u.name AS unit_name, ui.name AS unit_item_name, i.recipe_id
       FROM "Product" p
       JOIN "Ingredient" i ON p.ing_id = i.id
       LEFT JOIN "Unit" u ON p.unit_id = u.id
       LEFT JOIN "Unit" ui ON p.unit_item_id = ui.id
       WHERE p.home_id = $1 AND (p.stock_id IS NULL 
          OR p.stock_id IN (SELECT id FROM "homes_storages" WHERE home_id = $1))`,
      [homeId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return res.status(500).json({ error: "Une erreur s'est produite" });
  }
});

// ---------------------------
// UPDATE PRODUCT
// ---------------------------
router.put("/update/:h_id/:p_id", async (req, res) => {
  try {
    const productId = req.params.p_id;
    const homeId = req.params.h_id;
    const { ing_id, quantity, unit_id, quantity_item, unit_item_id, stock_id, expiry } = req.body;

    if (!quantity || !stock_id || !expiry) {
      return res.status(400).json({ error: "missing fields" });
    }

    // Vérifier si un produit identique existe déjà (fusion seulement si ing_id + stock_id + expiry + amount_item + unit_item_id identiques)
    if (ing_id) {
      const existing = await pool.query(
        `SELECT id, amount 
         FROM "Product"
         WHERE ing_id = $1 
           AND stock_id = $2 
           AND expiry = $3 
           AND amount_item = $4
           AND unit_item_id = $5
           AND id <> $6`,
        [ing_id, stock_id, expiry, quantity_item || null, unit_item_id || null, productId]
      );

      if (existing.rows.length > 0) {
        const existingProduct = existing.rows[0];
        const newAmount = Number(existingProduct.amount) + Number(quantity);

        await pool.query(
          `UPDATE "Product" SET amount = $1 WHERE id = $2`,
          [newAmount, existingProduct.id]
        );

        // Supprimer l’ancien produit modifié
        await pool.query(`DELETE FROM "Product" WHERE id = $1`, [productId]);

        return res.json({
          ok: true,
          merged: true,
          productId: existingProduct.id,
          newAmount
        });
      }
    }

    // Sinon mise à jour normale
    await pool.query(
      `UPDATE "Product"
       SET ing_id = $1, amount = $2, unit_id = $3, amount_item = $4, unit_item_id = $5, stock_id = $6, expiry = $7, home_id = $8
       WHERE id = $9`,
      [ing_id || null, quantity, unit_id || null, quantity_item || null, unit_item_id || null, stock_id, expiry, homeId, productId]
    );

    res.json({ ok: true, merged: false, productId });

  } catch (e) {
    console.error("ERROR /product/update:", e);
    res.status(500).json({ error: e.message });
  }
});


export default router;
