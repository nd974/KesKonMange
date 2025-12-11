import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { ing_id, amount, unit_id, stock_id, expiry, homeId} = req.body;

    console.log("ing_id, amount, unit_id, stock_id, expiry, homeId : ",ing_id, amount, unit_id, stock_id, expiry, homeId);

    if (!amount || !stock_id || !expiry) {
      return res.status(400).json({ error: "missing fields" });
    }

    // ⚠️ SI ing_id existe -> vérifier si produit déjà présent dans ce storage
    if ( ing_id ) {
      const existing = await pool.query(
        `SELECT id, amount
         FROM "Product"
         WHERE ing_id = $1 AND stock_id = $2 AND expiry = $3`,
        [ing_id, stock_id, expiry]
      );

      if (existing.rows.length > 0) {
        const existingProduct = existing.rows[0];

        // 🔥 mettre à jour la quantité
        const newAmount = Number(existingProduct.amount) + Number(amount);

        await pool.query(
          `UPDATE "Product"
           SET amount = $1
           WHERE id = $2`,
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

    // 🆕 sinon : insertion normale
    const insert = await pool.query(
      `INSERT INTO "Product" (ing_id, amount, unit_id, stock_id, expiry, home_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [ing_id || null, amount, unit_id || null, stock_id, expiry, homeId]
    );

    res.json({
      ok: true,
      merged: false,
      productId: insert.rows[0].id
    });
  } catch (e) {
    console.error("ERROR /product/create:", e);
    res.status(500).json({ error: e.message });
  }
});


router.get("/getProducts/:homeId", async (req, res) => {
  const { homeId } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.id, p.ing_id, p.amount, p.unit_id, p.stock_id, p.expiry, p.home_id,
              i.name AS ingredient_name, u.name AS unit_name
       FROM "Product" p
       JOIN "Ingredient" i ON p.ing_id = i.id
       LEFT JOIN "Unit" u ON p.unit_id = u.id
       WHERE p.home_id = $1 AND (p.stock_id IS NULL 
          OR p.stock_id IN (SELECT id FROM "homes_storages" WHERE home_id = $1))`, // Fermeture correcte de la parenthèse
      [homeId]
    );

    return res.json(result.rows);
    
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return res.status(500).json({ error: "Une erreur s'est produite" });
  }
});

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

router.put("/update/:h_id/:p_id", async (req, res) => {
  try {
    const productId = req.params.p_id;
    const homeId = req.params.h_id;
    const { ing_id, quantity, unit_id, stock_id, expiry } = req.body;

    console.log("update product");
    console.log("ing_id, quantity, unit_id, stock_id, expiry, homeId : ",ing_id, quantity, unit_id, stock_id, expiry, homeId);

    if (!quantity || !stock_id || !expiry) {
      return res.status(400).json({ error: "missing fields" });
    }

    // ⚠️ Vérifier si un produit identique existe déjà dans ce stockage
    if (ing_id) {
      const existing = await pool.query(
        `SELECT id, amount
         FROM "Product"
         WHERE ing_id = $1 AND stock_id = $2 AND expiry = $3 AND id <> $4`,
        [ing_id, stock_id, expiry, productId]
      );

      if (existing.rows.length > 0) {
        const existingProduct = existing.rows[0];

        // 🔥 Fusionner les quantités
        const newAmount = Number(existingProduct.amount) + Number(quantity);

        await pool.query(
          `UPDATE "Product"
           SET amount = $1
           WHERE id = $2`,
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

    // Sinon, mise à jour normale
    await pool.query(
      `UPDATE "Product"
       SET ing_id = $1, amount = $2, unit_id = $3, stock_id = $4, expiry = $5, home_id = $6
       WHERE id = $7`,
      [ing_id || null, quantity, unit_id || null, stock_id, expiry, homeId, productId]
    );

    res.json({ ok: true, merged: false, productId });
  } catch (e) {
    console.error("ERROR /product/update:", e);
    res.status(500).json({ error: e.message });
  }
});


export default router;