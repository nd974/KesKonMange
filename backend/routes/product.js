import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { ing_id, amount, unit_id, stock_id, expiry} = req.body;

    console.log("create product");
    console.log("ing_id, amount, unit_id, stock_id, expiry : ",ing_id, amount, unit_id, stock_id, expiry);

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
      `INSERT INTO "Product" (ing_id, amount, unit_id, stock_id, expiry)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [ing_id || null, amount, unit_id || null, stock_id, expiry]
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
      `SELECT p.id, p.ing_id, p.amount, p.unit_id, p.stock_id, p.expiry,
              i.name AS ingredient_name, u.name AS unit_name
       FROM "Product" p
       JOIN "Ingredient" i ON p.ing_id = i.id
       LEFT JOIN "Unit" u ON p.unit_id = u.id
       WHERE p.stock_id IN (
         SELECT id FROM "homes_storages" WHERE home_id = $1
       )`,
      [homeId]
    );

    // 🔥 Toujours renvoyer un tableau, même vide !
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

router.post("/move", async (req, res) => {
  try {
    const { product_id, new_stock_id } = req.body;

    if (!product_id || !new_stock_id) {
      return res.status(400).json({ error: "missing fields" });
    }

    // Récupération du produit original
    const origin = await pool.query(
      `SELECT * FROM "Product" WHERE id = $1`,
      [product_id]
    );

    if (origin.rows.length === 0) {
      return res.status(404).json({ error: "product not found" });
    }

    const prod = origin.rows[0];

    // Vérifier si un produit identique existe déjà dans la nouvelle storage
    const existing = await pool.query(
      `SELECT id, amount
       FROM "Product"
       WHERE ing_id = $1 AND unit_id = $2 AND expiry = $3 AND stock_id = $4`,
      [prod.ing_id, prod.unit_id, prod.expiry, new_stock_id]
    );

    if (existing.rows.length > 0) {
      const target = existing.rows[0];

      // Fusion : ajout des quantités
      const newAmount = Number(target.amount) + Number(prod.amount);

      await pool.query(
        `UPDATE "Product" SET amount = $1 WHERE id = $2`,
        [newAmount, target.id]
      );

      // supprimer l'ancien produit
      await pool.query(`DELETE FROM "Product" WHERE id = $1`, [product_id]);

      return res.json({
        ok: true,
        merged: true,
        targetProductId: target.id,
        newAmount
      });
    }

    // Pas de fusion → simple déplacement
    await pool.query(
      `UPDATE "Product"
       SET stock_id = $1
       WHERE id = $2`,
      [new_stock_id, product_id]
    );

    return res.json({
      ok: true,
      merged: false,
      movedId: product_id
    });

  } catch (e) {
    console.error("ERROR /product/move:", e);
    return res.status(500).json({ error: e.message });
  }
});


export default router;