import express from "express";
import { pool } from "../db.js";
import cloudinary from "cloudinary";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
      const { recipeName, time, portions, difficulty, selectedTagIds, ingredients, ustensiles, steps } = req.body;

      const missingFields = [];

      // Vérifier string vide ou absent
      if (!recipeName || recipeName.trim() === '') missingFields.push('Nom de la recette manquant');

      // Vérifier sous-champs de time
      if (!time || time.nettoyage === "") missingFields.push('Temps de préparation manquant');
      if (!time || time.nettoyage === "") missingFields.push('Temps de cuisson manquant');
      if (!time || time.nettoyage === "") missingFields.push('Temps de repos manquant');
      if (!time || time.nettoyage === "") missingFields.push('Temps de nettoyage manquant');

      // Autres champs

      if (!portions) missingFields.push('Nombre de portions manquant');
      if (!difficulty) missingFields.push('Difficulté manquante');
      if (!ingredients || ingredients[0].name==="" || ingredients[0].quantity==="") missingFields.push('Liste d’ingrédients vide ou invalide');
      if (!ustensiles || ustensiles[0]==="") missingFields.push('Liste d’ustensiles vide ou invalide');
      if (!steps || steps[0]==="") missingFields.push('Liste des étapes vide ou invalide');

      // Si un ou plusieurs champs manquent, renvoyer la liste
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: 'Champs manquants',
          details: missingFields
        });
      }



    // Insertion de la recette
    const resultRecipeCreate = await pool.query(
      `
      INSERT INTO "Recipe" (name, time_prep, time_cook, time_rest, time_clean, portion, level, picture) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
      `,
      [recipeName,time.preparation,time.cuisson,time.repos,time.nettoyage,portions,difficulty,null]
    );
    const recipeId = resultRecipeCreate.rows[0].id;

    // Insertion des liaisons avec les tags (si présents)
    if (Array.isArray(selectedTagIds) && selectedTagIds.length > 0) {
      const insertTagPromises = selectedTagIds.map((tagId) => {
        return pool.query(
          `
          INSERT INTO "recipes_tags" (recipe_id, tag_id)
          VALUES ($1, $2)
          `,
          [recipeId, tagId]
        );
      });
      await Promise.all(insertTagPromises);
    }

    // Insertion des ingrédients
    if (Array.isArray(ingredients) && ingredients.length > 0) {
      const insertIngPromises = ingredients.map(async (ing) => {
        const { name, quantity, unit, selected } = ing;

        // 1. Vérifier si l’ingrédient existe
        let ingredientResult = await pool.query(
          `SELECT id FROM "Ingredient" WHERE name = $1`,
          [name]
        );

        let ingredientId;
        if (ingredientResult.rows.length === 0) {
          // → L’ingrédient n'existe pas, on le crée
          let insertIngredient = await pool.query(
            `INSERT INTO "Ingredient" (name, selected) VALUES ($1, $2) RETURNING id`,
            [name, selected]
          );
          ingredientId = insertIngredient.rows[0].id;
        } else {
          ingredientId = ingredientResult.rows[0].id;
        }

        // 2. Récupérer l’ID de l’unité
        const unitResult = await pool.query(
          `SELECT id FROM "Unit" WHERE abbreviation = $1`,
          [unit]
        );

        const unitId = unitResult.rows.length > 0 ? unitResult.rows[0].id : null;

        // 3. Insérer dans recipes_ingredients
        await pool.query(
          `
          INSERT INTO recipes_ingredients (recipe_id, ingredient_id, amount, unit_id)
          VALUES ($1, $2, $3, $4)
          `,
          [recipeId, ingredientId, quantity, unitId]
        );
      });
      await Promise.all(insertIngPromises);
    }

    // Ajout dans recipes_utensils(recipe_id, utensi_id)
    if (Array.isArray(ustensiles) && ustensiles.length > 0) {
      const insertUtensilPromises = ustensiles.map(async (u) => {
        const name = u.trim();

        // 1. Récupérer l’ID de l’ustensile
        const utensilResult = await pool.query(
          `SELECT id FROM "Utensil" WHERE name = $1`,
          [name]
        );

        if (utensilResult.rows.length === 0) {
          throw new Error(`Ustensile '${name}' non trouvé dans Utensil`);
        }

        const utensilId = utensilResult.rows[0].id;

        // 2. Insérer dans la relation N-N
        await pool.query(
          `
          INSERT INTO "recipes_utensils" (recipe_id, utensil_id)
          VALUES ($1, $2)
          `,
          [recipeId, utensilId]
        );
      });

      await Promise.all(insertUtensilPromises);
    }


    // Insertion des étapes si elles existent
    if (Array.isArray(steps) && steps.length > 0) {
      const insertStepsPromises = steps.map((step, index) => {
        return pool.query(
          `
          INSERT INTO "recipes_steps" (recipe_id, step)
          VALUES ($1, $2)
          `,
          [recipeId, `${index+1}. ${step}`]
        );
      });
      await Promise.all(insertStepsPromises);
    }



    res.json({ ok: true, recipeId });
  } catch (e) {
    console.error("Erreur lors de la création de la recette :", e);
    res.status(500).json({ error: e.message });
  }
});

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

    const utensilRes = await pool.query(
      `SELECT u.id, u.name, u.picture
       FROM "recipes_utensils" ru
       JOIN "Utensil" u ON u.id = ru.utensil_id
       WHERE ru.recipe_id = $1`,
      [id]
    );
    recipe.utensils = utensilRes.rows || [];

    const ingredientRes = await pool.query(
      `SELECT 
          i.id, 
          i.name, 
          ri.amount, 
          u.abbreviation AS unit
      FROM "recipes_ingredients" ri
      JOIN "Ingredient" i ON i.id = ri.ingredient_id
      LEFT JOIN "Unit" u ON u.id = ri.unit_id
      WHERE ri.recipe_id = $1`,
      [id]
    );
    recipe.ingredients = ingredientRes.rows || [];

    const stepsRes = await pool.query(
      `SELECT step FROM "recipes_steps" rs WHERE rs.recipe_id = $1 ORDER BY step ASC` ,[id]
    );
    recipe.steps = stepsRes.rows || [];


    res.json(recipe);
  } catch (err) {
    console.error("Erreur /recipe/get-one:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});










router.post("/setImage", async (req, res) => {
  try {
    const { recipeId, pictureName } = req.body;

    if (!recipeId || !pictureName) {
      return res.status(400).json({ error: "recipeId et pictureName sont requis" });
    }

    const result = await pool.query(
      `UPDATE "Recipe" SET picture = $1 WHERE id = $2 RETURNING id, picture`,
      [pictureName, recipeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }

    res.json({ ok: true, recipe: result.rows[0] });
  } catch (err) {
    console.error("Erreur dans /recipe/setImage :", err);
    res.status(500).json({ error: err.message });
  }
});



// Configuration Cloudinary
cloudinary.v2.config({
  cloud_name: `${process.env.CLOUDINARY_NAME}`,
  api_key: `${process.env.CLOUDINARY_KEY}`,
  api_secret: `${process.env.CLOUDINARY_SECRET}`,
});

cloudinary.v2.api.usage((error, result) => {
  if (error) {
    console.error(error);
  } else {
    console.log("Usage actuel :", result);
  }
});


router.delete("/delete/:id", async (req, res) => {
  const recipeId = parseInt(req.params.id, 10);

  if (isNaN(recipeId)) {
    return res.status(400).json({ error: "ID de recette invalide" });
  }

  try {
    // 1️⃣ Récupérer le publicId de l'image liée à la recette
    const imageResult = await pool.query(
      `SELECT name FROM "Recipe" WHERE id = $1`,
      [recipeId]
    );

    if (imageResult.rowCount === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }

    const publicId = imageResult.rows[0].name;

    // 2️⃣ Récupérer les ingrédients liés à cette recette avant suppression
    const ingredientsResult = await pool.query(
      `SELECT ingredient_id FROM recipes_ingredients WHERE recipe_id = $1`,
      [recipeId]
    );

    const ingredientIds = ingredientsResult.rows.map(row => row.ingredient_id);

    // 3️⃣ Supprimer la recette
    await pool.query(
      `DELETE FROM "Recipe" WHERE id = $1`,
      [recipeId]
    );

    // 4️⃣ Supprimer les relations dans recipes_ingredients
    await pool.query(
      `DELETE FROM recipes_ingredients WHERE recipe_id = $1`,
      [recipeId]
    );

    // 5️⃣ Supprimer les ingrédients non utilisés par d'autres recettes
    for (const ingId of ingredientIds) {
      await pool.query(
        `
        DELETE FROM "Ingredient"
        WHERE id = $1
          AND NOT EXISTS (
            SELECT 1 FROM recipes_ingredients ri WHERE ri.ingredient_id = $1
          )
        `,
        [ingId]
      );
    }

    // 6️⃣ Supprimer l'image sur Cloudinary si elle existe
    if (publicId) {
      try {
        const cloudDelete = await cloudinary.v2.uploader.destroy(publicId);
        console.log("Cloudinary:", cloudDelete);
      } catch (err) {
        console.error("⚠️ Erreur suppression Cloudinary :", err);
      }
    }

    res.json({
      ok: true,
      deletedRecipeId: recipeId,
      deletedImagePublicId: publicId || null,
    });

  } catch (e) {
    console.error("Erreur lors de la suppression de la recette/image :", e);
    res.status(500).json({ error: e.message });
  }
});



export default router;
