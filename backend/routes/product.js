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

    // await pool.query(
    //   `INSERT INTO storages_products (home_storage_id, product_id)
    //    VALUES ($1, $2)`,
    //   [stock_id, insert.rows[0].id]
    // );

    // 8	91	9
    // 9	94	10
    // 10	91	11
    // 11	93	12
    // 12	91	13

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
  const { homeId } = req.params; // Récupère l'ID de la home passé dans l'URL

  try {
    // Récupérer tous les produits associés à ce homeId
    const result = await pool.query(
      `SELECT p.id, p.ing_id, p.amount, p.unit_id, p.stock_id, p.expiry, i.name AS ingredient_name, u.name AS unit_name
       FROM "Product" p
       JOIN "Ingredient" i ON p.ing_id = i.id
       LEFT JOIN "Unit" u ON p.unit_id = u.id
       WHERE p.stock_id IN (SELECT id FROM "homes_storages" WHERE home_id = $1)`,
      [homeId]
    );

    const products = result.rows;

    // Si des produits sont trouvés, on les retourne
    if (products.length > 0) {
      return res.json(products);
    } else {
      return res.status(404).json({ error: "Aucun produit trouvé pour cette home" });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return res.status(500).json({ error: "Une erreur s'est produite" });
  }
});


export default router;