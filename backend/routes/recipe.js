import express from "express";
import { pool } from "../db.js";
import cloudinary from "cloudinary";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
      const { recipeName, time, portions, difficulty, selectedTagIds, ingredients, ustensiles, steps } = req.body;

      const missingFields = [];

      console.log("INGGGGGGGGGGGGG:", ingredients);

      // Vérifier string vide ou absent
      if (!recipeName || recipeName.trim() === '') missingFields.push('Nom de la recette manquant');

      // Vérifier sous-champs de time
      if (!time || time.preparation === "") missingFields.push('Temps de préparation manquant');
      if (!time || time.cuisson === "") missingFields.push('Temps de cuisson manquant');
      if (!time || time.repos === "") missingFields.push('Temps de repos manquant');
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
    console.log("ingredientsingredientsingredientsingredients :", ingredients);
    // Insertion des ingrédients
    if (Array.isArray(ingredients) && ingredients.length > 0) {
      const insertIngPromises = ingredients.map(async (ing) => {
        const {
          name,
          quantity,
          unit,
          quantity_item,
          unit_item,
          selected
        } = ing;

        // 1️⃣ Ingrédient
        let ingredientResult = await pool.query(
          `SELECT id FROM "Ingredient" WHERE name = $1`,
          [name]
        );

        let ingredientId;
        if (ingredientResult.rows.length === 0) {
          let recipeResult = await pool.query(
            `SELECT id FROM "Recipe" WHERE name = $1`,
            [name]
          );

          const rec_id =
            recipeResult.rows.length > 0
              ? recipeResult.rows[0].id
              : null;

          const insertIng = await pool.query(
            `INSERT INTO "Ingredient" (name, selected, recipe_id)
            VALUES ($1, $2, $3)
            RETURNING id`,
            [name, selected, rec_id]
          );

          ingredientId = insertIng.rows[0].id;
        } else {
          ingredientId = ingredientResult.rows[0].id;
        }

        // 2️⃣ Unit principale
        const unitResult = await pool.query(
          `SELECT id FROM "Unit" WHERE abbreviation = $1`,
          [unit]
        );
        const unitId =
          unitResult.rows.length > 0 ? unitResult.rows[0].id : null;

        // 3️⃣ Unit item (optionnelle)
        let unitItemId = null;
        if (unit_item) {
          const unitItemResult = await pool.query(
            `SELECT id FROM "Unit" WHERE abbreviation = $1`,
            [unit_item]
          );
          unitItemId =
            unitItemResult.rows.length > 0
              ? unitItemResult.rows[0].id
              : null;
        }

        // 4️⃣ Insert relation
        await pool.query(
          `
          INSERT INTO recipes_ingredients
          (recipe_id, ingredient_id, amount, unit_id, amount_item, unit_item_id)
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            recipeId,
            ingredientId,
            quantity || null,
            unitId,
            quantity_item || null,
            unitItemId
          ]
        );
      });

      await Promise.all(insertIngPromises);
    }


    // Ajout dans recipes_utensils(recipe_id, utensil_id)
    if (Array.isArray(ustensiles) && ustensiles.length > 0) {

      const insertUtensilPromises = ustensiles.map(async (u) => {
        const name = u.trim();

        if (!name) return; // skip vide

        try {
          // 1. Récupérer l’ID de l’ustensile
          const utensilResult = await pool.query(
            `SELECT id FROM "Utensil" WHERE name = $1`,
            [name]
          );

          // ⚠️ Si l’ustensile n'existe pas → on skip simplement
          if (utensilResult.rows.length === 0) {
            console.warn(`Ustensile ignoré (non trouvé) : '${name}'`);
            return; // skip propre
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

        } catch (err) {
          console.error(`Erreur lors du traitement de l’ustensile '${name}':`, err);
          // ⚠️ On skip aussi en cas d’erreur SQL sur cet élément.
          return;
        }
      });

      // Attendre que tout soit fini
      await Promise.all(insertUtensilPromises);
    }


  // Insertion des étapes si elles existent
  if (Array.isArray(steps) && steps.length > 0) {
    const insertStepsPromises = steps.map(async (step, index) => {

      // 1. Créer la ligne dans "Step"
      const stepRes = await pool.query(
        `
        INSERT INTO "Step" ("number", description, time, level)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
        [index + 1, step.text, step.time || 0, step.level || 0]
      );

      const stepId = stepRes.rows[0].id;

      // 2. Lier avec la recette
      await pool.query(
        `
        INSERT INTO "recipes_steps" (recipe_id, step_id)
        VALUES ($1, $2)
        `,
        [recipeId, stepId]
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

router.put("/update/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;

    const { recipeName, time, portions, difficulty, selectedTagIds, ingredients, ustensiles, steps } = req.body;

    const missingFields = [];

    // Vérifier string vide ou absent
    if (!recipeName || recipeName.trim() === '') missingFields.push('Nom de la recette manquant');

    // Vérifier sous-champs de time
    if (!time || time.preparation === null) missingFields.push('Temps de préparation manquant');
    if (!time || time.cuisson === null) missingFields.push('Temps de cuisson manquant');
    if (!time || time.repos === null) missingFields.push('Temps de repos manquant');
    if (!time || time.nettoyage === null) missingFields.push('Temps de nettoyage manquant');

    // Autres champs
    if (!portions) missingFields.push('Nombre de portions manquant');
    if (!difficulty) missingFields.push('Difficulté manquante');
    if (!ingredients || ingredients[0].name==='' || ingredients[0].quantity===null) 
      missingFields.push('Liste d’ingrédients vide ou invalide');
    if (!ustensiles || ustensiles[0]==='') 
      missingFields.push('Liste d’ustensiles vide ou invalide');
    if (!steps || steps[0]==='') 
      missingFields.push('Liste des étapes vide ou invalide');

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Champs manquants',
        details: missingFields
      });
    }

    // --------------------------------------
    // 🚀 0. UPDATE base Ingredient si la recette est utlise en ingredient
    // --------------------------------------
    const ingredientLinkedRes = await pool.query(
      `SELECT id FROM "Ingredient" WHERE recipe_id = $1 LIMIT 1`,
      [recipeId]
    );

    // 🔁 Si trouvé → mettre à jour le nom de l'ingrédient
    if (ingredientLinkedRes.rows.length > 0) {
      await pool.query(
        `UPDATE "Ingredient"
        SET name = $1
        WHERE recipe_id = $2`,
        [recipeName, recipeId]
      );
    }

    // --------------------------------------
    // 🚀 1. UPDATE base de la recette
    // --------------------------------------
    await pool.query(
      `
      UPDATE "Recipe"
      SET name=$1, time_prep=$2, time_cook=$3, time_rest=$4, time_clean=$5,
          portion=$6, level=$7
      WHERE id=$8
      `,
      [recipeName, time.preparation, time.cuisson, time.repos, time.nettoyage, portions, difficulty, recipeId]
    );

    // --------------------------------------
    // 🚀 2. RESET + INSERT TAGS
    // --------------------------------------
    await pool.query(`DELETE FROM recipes_tags WHERE recipe_id=$1`, [recipeId]);

    if (Array.isArray(selectedTagIds) && selectedTagIds.length > 0) {
      const tagPromises = selectedTagIds.map(tagId => {
        return pool.query(
          `INSERT INTO recipes_tags (recipe_id, tag_id) VALUES ($1, $2)`,
          [recipeId, tagId]
        );
      });
      await Promise.all(tagPromises);
    }

    // --------------------------------------
    // 🚀 3. RESET + INSERT INGRÉDIENTS
    // --------------------------------------
    await pool.query(
      `DELETE FROM recipes_ingredients WHERE recipe_id = $1`,
      [recipeId]
    );

    if (Array.isArray(ingredients) && ingredients.length > 0) {
      const ingPromises = ingredients.map(async (ing) => {
        const {
          name,
          quantity,
          unit,
          quantity_item,
          unit_item,
          selected
        } = ing;

        // 1️⃣ Ingrédient
        let ingredientResult = await pool.query(
          `SELECT id FROM "Ingredient" WHERE name = $1`,
          [name]
        );

        let ingredientId;
        if (ingredientResult.rows.length === 0) {
          let recipeResult = await pool.query(
            `SELECT id FROM "Recipe" WHERE name = $1`,
            [name]
          );

          const rec_id =
            recipeResult.rows.length > 0
              ? Number(recipeResult.rows[0].id)
              : null;

          const insertIng = await pool.query(
            `INSERT INTO "Ingredient" (name, selected, recipe_id)
            VALUES ($1, $2, $3)
            RETURNING id`,
            [name, selected, rec_id]
          );

          ingredientId = insertIng.rows[0].id;
        } else {
          ingredientId = ingredientResult.rows[0].id;
        }

        // 2️⃣ Unit principale
        const unitResult = await pool.query(
          `SELECT id FROM "Unit" WHERE abbreviation = $1`,
          [unit]
        );
        const unitId =
          unitResult.rows.length > 0 ? unitResult.rows[0].id : null;

        // 3️⃣ Unit item (optionnelle)
        let unitItemId = null;
        if (unit_item) {
          const unitItemResult = await pool.query(
            `SELECT id FROM "Unit" WHERE abbreviation = $1`,
            [unit_item]
          );
          unitItemId =
            unitItemResult.rows.length > 0
              ? unitItemResult.rows[0].id
              : null;
        }

        // 4️⃣ Insert relation
        await pool.query(
          `
          INSERT INTO recipes_ingredients
          (recipe_id, ingredient_id, amount, unit_id, amount_item, unit_item_id)
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            recipeId,
            ingredientId,
            quantity || null,
            unitId,
            quantity_item || null,
            unitItemId
          ]
        );
      });

      await Promise.all(ingPromises);
    }


    // --------------------------------------
    // 🚀 4. RESET + INSERT USTENSILES
    // --------------------------------------
    await pool.query(`DELETE FROM recipes_utensils WHERE recipe_id=$1`, [recipeId]);

    if (Array.isArray(ustensiles) && ustensiles.length > 0) {
      const utensilPromises = ustensiles.map(async (u) => {
        const name = u.trim();
        if (!name) return;

        try {
          const utensilResult = await pool.query(
            `SELECT id FROM "Utensil" WHERE name=$1`,
            [name]
          );

          if (utensilResult.rows.length === 0) {
            console.warn(`Ustensile ignoré : '${name}'`);
            return;
          }

          const utensilId = utensilResult.rows[0].id;

          await pool.query(
            `
            INSERT INTO recipes_utensils (recipe_id, utensil_id)
            VALUES ($1, $2)
            `,
            [recipeId, utensilId]
          );
        } catch (err) {
          console.error(`Erreur ustensile '${name}' :`, err);
          return;
        }
      });

      await Promise.all(utensilPromises);
    }

    // --------------------------------------
    // 🚀 5. RESET + INSERT ÉTAPES
    // --------------------------------------

    // 1. Récupérer les anciens step_id pour suppression
    const oldSteps = await pool.query(
      `SELECT step_id FROM recipes_steps WHERE recipe_id=$1`,
      [recipeId]
    );

    // 2. Supprimer relations
    await pool.query(`DELETE FROM recipes_steps WHERE recipe_id=$1`, [recipeId]);

    // 3. Supprimer les Steps orphelins
    if (oldSteps.rows.length > 0) {
      const ids = oldSteps.rows.map(r => r.step_id);
      await pool.query(
        `DELETE FROM "Step" WHERE id = ANY($1)`,
        [ids]
      );
    }

    // 4. Réinsérer les steps
    if (Array.isArray(steps) && steps.length > 0) {
      console.log("Inserting steps:", steps);
      const stepsPromises = steps.map(async (step, index) => {

        // Créer step
        const stepRes = await pool.query(
          `
          INSERT INTO "Step" ("number", description, time, level)
          VALUES ($1, $2, $3, $4)
          RETURNING id
          `,
          [index + 1, step.text, step.time || 0, step.level || 0]
        );

        const stepId = stepRes.rows[0].id;

        // Lier
        await pool.query(
          `
          INSERT INTO recipes_steps (recipe_id, step_id)
          VALUES ($1, $2)
          `,
          [recipeId, stepId]
        );
      });

      await Promise.all(stepsPromises);
    }


    res.json({ ok: true, recipeId });

  } catch (e) {
    console.error("Erreur lors de l’update :", e);
    res.status(500).json({ error: e.message });
  }
});


/**
 * GET /recipe/get-all
 * Récupère toutes les recettes avec leurs tags
 */
router.post("/get-all", async (req, res) => {
  const { profileId } = req.body;
  try {
    // 🔹 Récupérer toutes les recettes
    const { rows: recipes } = await pool.query(`
      SELECT 
        r.id,
        r.name,
        r.time_prep,
        r.time_cook,
        r.time_rest,
        r.time_clean,
        r.portion,
        r.level,
        r.picture,
        rs.note,
        COALESCE(rs.usage_count, 0) AS usage_count
      FROM "Recipe" r
      LEFT JOIN recipes_stats rs 
        ON r.id = rs.recipe_id AND rs.profile_id = $1
      ORDER BY r.name ASC
    `, [profileId]);

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

router.get("/get-one/:homeId/:id", async (req, res) => {
  try {
    const { homeId, id } = req.params;

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
      `
SELECT
  i.id,
  i.name,
  i.selected,
  i.recipe_id,
  COALESCE(r.picture, i.picture) AS picture,

  ri.amount,
  u.abbreviation AS unit,
  u.id AS unit_id,

  ri.amount_item,
  ui.abbreviation AS unit_item,
  ui.id AS unit_item_id,

  -- prix minimum parmi tous les shops du home
  MIN(si.price) AS price,
  MIN(si.unit_id) AS price_unit_id

FROM recipes_ingredients ri
JOIN "Ingredient" i ON i.id = ri.ingredient_id
LEFT JOIN "Unit" u ON u.id = ri.unit_id
LEFT JOIN "Unit" ui ON ui.id = ri.unit_item_id
LEFT JOIN "Recipe" r ON i.recipe_id = r.id

-- joindre les shops du home
LEFT JOIN homes_shops hs ON hs.home_id = $2

-- prix pour chaque shop
LEFT JOIN shops_ingredients si
  ON si.ing_id = i.id AND si.shop_id = hs.id

WHERE ri.recipe_id = $1

GROUP BY
  i.id,
  i.name,
  i.selected,
  i.recipe_id,
  r.picture,
  i.picture,
  ri.amount,
  u.abbreviation,
  u.id,
  ri.amount_item,
  ui.abbreviation,
  ui.id

ORDER BY i.recipe_id, u.abbreviation NULLS FIRST;


      `,
      [id, homeId]  // $1 = recipe_id, $2 = homeId pour les prix
    );
    recipe.ingredients = ingredientRes.rows || [];

    const stepsRes = await pool.query(
      `
      SELECT 
        s.id,
        s.number,
        s.description,
        s.time,
        s.level
      FROM recipes_steps rs
      JOIN "Step" s ON s.id = rs.step_id
      WHERE rs.recipe_id = $1
      ORDER BY s.number ASC
      `,
      [id]
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

router.delete("/delete-image/:publicId", async (req, res) => {
  const { publicId } = req.params;

  if (!publicId) {
    return res.status(400).json({ error: "publicId manquant" });
  }

  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    res.json({ success: true, cloudinary: result });
  } catch (err) {
    console.error("Erreur Cloudinary :", err);
    res.status(500).json({ error: err.message });
  }
});


router.delete("/delete/:id", async (req, res) => {
  const recipeId = parseInt(req.params.id, 10);

  if (isNaN(recipeId)) {
    return res.status(400).json({ error: "ID de recette invalide" });
  }

  try {
    // 1️⃣ Récupérer le publicId (image)
    const imageResult = await pool.query(
      `SELECT name FROM "Recipe" WHERE id = $1`,
      [recipeId]
    );

    if (imageResult.rowCount === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }

    const publicId = imageResult.rows[0].name;

    // 2️⃣ Récupérer les ingrédients liés avant suppression
    const ingredientsResult = await pool.query(
      `SELECT ingredient_id FROM recipes_ingredients WHERE recipe_id = $1`,
      [recipeId]
    );

    const ingredientIds = ingredientsResult.rows.map(r => r.ingredient_id);

    // 3️⃣ Récupérer les steps liés avant suppression
    const stepsResult = await pool.query(
      `SELECT step_id FROM recipes_steps WHERE recipe_id = $1`,
      [recipeId]
    );

    const stepIds = stepsResult.rows.map(r => r.step_id);

    // 4️⃣ Supprimer la recette
    await pool.query(
      `DELETE FROM "Recipe" WHERE id = $1`,
      [recipeId]
    );

    // 5️⃣ Supprimer les relations dans recipes_ingredients
    await pool.query(
      `DELETE FROM recipes_ingredients WHERE recipe_id = $1`,
      [recipeId]
    );

    // 6️⃣ Supprimer les ingrédients orphelins
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

    // 7️⃣ Supprimer les relations dans recipes_steps
    await pool.query(
      `DELETE FROM recipes_steps WHERE recipe_id = $1`,
      [recipeId]
    );

    // 8️⃣ Supprimer les steps orphelins
    if (stepIds.length > 0) {
      await pool.query(
        `
        DELETE FROM "Step"
        WHERE id = ANY($1)
        AND NOT EXISTS (
          SELECT 1 FROM recipes_steps rs WHERE rs.step_id = ANY($1)
        )
        `,
        [stepIds]
      );
    }

    // 9️⃣ Supprimer l'image Cloudinary
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
      deletedImagePublicId: publicId || null
    });

  } catch (e) {
    console.error("Erreur lors de la suppression :", e);
    res.status(500).json({ error: e.message });
  }
});








router.get("/getSimilar/:id", async (req, res) => {
  const recipeId = req.params.id;

  try {
    // 🔹 0️⃣ Récupérer tous les descendants des parents autorisés
    const allowedParents = ['Cuisine du monde', 'Famille Plats', 'Fêtes', 'Régime'];
    const allowedDescendantsRes = await pool.query(
      `
      WITH RECURSIVE descendants AS (
        SELECT id
        FROM "Tag"
        WHERE parent_id IN (
          SELECT id FROM "Tag" WHERE name = ANY($1)
        )

        UNION ALL

        SELECT t.id
        FROM "Tag" t
        JOIN descendants d ON t.parent_id = d.id
      )
      SELECT id FROM descendants;
      `,
      [allowedParents]
    );

    const allowedTagIds = allowedDescendantsRes.rows.map(t => t.id);
    if (allowedTagIds.length === 0) return res.json([]);

    // 🔹 1️⃣ Récupérer les tags de la recette
    const baseTagsRes = await pool.query(
      `SELECT tag_id FROM recipes_tags WHERE recipe_id = $1`,
      [recipeId]
    );
    const baseTags = baseTagsRes.rows.map(t => t.tag_id);
    if (baseTags.length === 0) return res.json([]);

    // 🔹 2️⃣ Filtrer les tags de la recette pour ne garder que les descendants autorisés
    const relevantTags = baseTags.filter(tagId => allowedTagIds.includes(tagId));
    if (relevantTags.length === 0) return res.json([]);

    // 🔹 3️⃣ Récupérer les recettes similaires
    const similarRecipes = await pool.query(
      `
      SELECT DISTINCT r.*
      FROM "Recipe" r
      JOIN recipes_tags rt ON rt.recipe_id = r.id
      WHERE rt.tag_id = ANY($1)
      AND r.id != $2
      `,
      [relevantTags, recipeId]
    );

    res.json(similarRecipes.rows);

  } catch (err) {
    console.error("❌ SQL error:", err);
    res.status(500).json({ error: err.message });
  }
});




router.post("/getStats", async (req, res) => {
  try {
    const { recipeId, profileId } = req.body;

    if (!recipeId || !profileId) {
      return res.status(400).json({ error: "recipeId et profileId sont requis" });
    }

    const result = await pool.query(
      `
      SELECT note, comment, usage_count
      FROM recipes_stats
      WHERE recipe_id = $1 AND profile_id = $2
      `,
      [recipeId, profileId]
    );

    res.json({ ok: true, stats: result.rows[0] || null });
  } catch (err) {
    console.error("Erreur dans /recipe/getStats :", err);
    res.status(500).json({ error: err.message });
  }
});



router.post("/setStats", async (req, res) => {
  try {
    const { recipeId, profileId, note, comment } = req.body;

    if (!recipeId || !profileId) {
      return res.status(400).json({ error: "recipeId et profileId sont requis" });
    }

    if (note < 0 || note > 5) {
      return res.status(400).json({ error: "note doit être entre 0 et 5" });
    }

    await pool.query(
      `
      INSERT INTO recipes_stats (recipe_id, profile_id, note, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (recipe_id, profile_id)
      DO UPDATE SET
        note    = EXCLUDED.note,
        comment = EXCLUDED.comment
      `,
      [recipeId, profileId, note, comment]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Erreur dans /recipe/setStats :", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/getComments", async (req, res) => {
  try {
    const { recipeId, profileId } = req.body;

    if (!recipeId) {
      return res.status(400).json({ error: "recipeId est requis" });
    }

    if (!profileId) {
      return res.status(400).json({ error: "profileId est requis" });
    }

    const result = await pool.query(
      `
      SELECT 
        rs.profile_id,
        rs.comment, 
        rs.note,
        rs.updated_date, 
        p.name AS profile_name,
        p.username AS profile_username,
        p.avatar AS profile_avatar,
        -- colonne temporaire : 0 si c'est le profil connecté, 1 sinon
        CASE WHEN rs.profile_id = $2 THEN 0 ELSE 1 END AS is_other
      FROM recipes_stats rs
      JOIN "Profile" p ON p.id = rs.profile_id
      WHERE rs.recipe_id = $1
      ORDER BY is_other ASC, rs.note DESC, rs.profile_id ASC;
      `,
      [recipeId, profileId]
    );

    res.json({ ok: true, comments: result.rows });
  } catch (err) {
    console.error("❌ Erreur dans /recipe/getComments:", err);
    res.status(500).json({ error: err.message });
  }
});


router.post("/getRating", async (req, res) => {
  try {
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).json({ error: "recipeId est requis" });
    }

    const result = await pool.query(
      `
      SELECT 
        ROUND(AVG(note)::numeric, 1) AS average_note,
        COUNT(note) AS votes_count
      FROM recipes_stats
      WHERE recipe_id = $1
        AND note IS NOT NULL
      `,
      [recipeId]
    );

    const { average_note, votes_count } = result.rows[0];

    res.json({ ok: true, averageNote: average_note || 0, votesCount: parseInt(votes_count) || 0 });
  } catch (err) {
    console.error("❌ Erreur dans /recipe/getRating:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /recipe/deleteStats
router.post("/deleteStats", async (req, res) => {
  try {
    const { recipeId, profileId } = req.body;

    if (!recipeId || !profileId) {
      return res.status(400).json({ error: "recipeId et profileId sont requis" });
    }

    const result = await pool.query(
      `
      DELETE FROM recipes_stats
      WHERE recipe_id = $1 AND profile_id = $2
      RETURNING recipe_id, profile_id
      `,
      [recipeId, profileId]
    );

    console.log(recipeId, profileId);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Aucune entrée trouvée pour ce profil et cette recette" });
    }

    res.json({ ok: true, deleted: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur dans /recipe/deleteStats:", err);
    res.status(500).json({ error: err.message });
  }
});


router.post("/get-possible", async (req, res) => {
  const { homeId } = req.body;

  try {
    // 1️⃣ Récupérer toutes les recettes principales
    const { rows: allRecipes } = await pool.query(`
      SELECT id, name, portion, level, picture
      FROM "Recipe"
      ORDER BY name ASC
    `);

    // 2️⃣ Récupérer le stock du foyer
    const { rows: products } = await pool.query(`
      SELECT ing_id
      FROM "Product"
      WHERE home_id = $1
    `, [homeId]);
    const stockIngIds = new Set(products.map(p => p.ing_id));

    // 3️⃣ Récupérer tous les ingrédients finaux de toutes les recettes
    const { rows: ingredientsAll } = await pool.query(`
        WITH RECURSIVE recipe_tree AS (
          SELECT
            ri.recipe_id AS parent_recipe_id,
            ri.ingredient_id AS ingredient_id,
            i.recipe_id AS child_recipe_id
          FROM "recipes_ingredients" ri
          JOIN "Ingredient" i ON i.id = ri.ingredient_id

          UNION ALL

          SELECT
            rt.parent_recipe_id,
            ri.ingredient_id,
            i.recipe_id AS child_recipe_id
          FROM recipe_tree rt
          JOIN "recipes_ingredients" ri ON ri.recipe_id = rt.child_recipe_id
          JOIN "Ingredient" i ON i.id = ri.ingredient_id
          WHERE rt.child_recipe_id IS NOT NULL
        )
        SELECT DISTINCT
          rt.parent_recipe_id AS recipe_id,
          i.id AS ing_id,
          i.name
        FROM recipe_tree rt
        JOIN "Ingredient" i ON i.id = rt.ingredient_id
        WHERE rt.child_recipe_id IS NULL
    `);

    // 4️⃣ Récupérer toutes les recettes utilisées comme sous-recette
    const { rows: childRecipes } = await pool.query(`
      SELECT DISTINCT i.recipe_id AS child_recipe_id
      FROM "recipes_ingredients" ri
      JOIN "Ingredient" i ON i.id = ri.ingredient_id
      WHERE i.recipe_id IS NOT NULL
    `);
    const childRecipeIds = new Set(childRecipes.map(r => r.child_recipe_id));

    // 5️⃣ Construire un mapping recette -> ingrédients finaux
    const ingredientsByRecipe = {};
    for (const ing of ingredientsAll) {
      if (!ingredientsByRecipe[ing.recipe_id]) {
        ingredientsByRecipe[ing.recipe_id] = [];
      }
      ingredientsByRecipe[ing.recipe_id].push(ing);
    }

    // 6️⃣ Séparation OK / POSSIBLE en filtrant les sous-recettes
    const recipesOk = [];
    const recipesPossible = [];

    for (const recipe of allRecipes) {
      // Filtrer uniquement les recettes principales
      if (childRecipeIds.has(recipe.id)) continue;

      const recipeIngredients = ingredientsByRecipe[recipe.id] || [];
      const missingIngredients = recipeIngredients.filter(
        ing => !stockIngIds.has(ing.ing_id)
      );

      if (missingIngredients.length === 0) {
        recipesOk.push(recipe);
      } else {
        recipesPossible.push({
          recipe,
          missingIngredients,
          missingCount: missingIngredients.length,
        });
      }
    }

    // 7️⃣ Envoyer la réponse
    res.json({ recipesOk, recipesPossible });

  } catch (err) {
    console.error("Erreur /recipe/get-possible:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});






export default router;
