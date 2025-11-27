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

// ------------------- GET TAGS FOPR MENUS -------------------
router.post("/get-tags-for-menus", async (req, res) => {
  const { menuIds } = req.body;
  if (!Array.isArray(menuIds) || menuIds.length === 0) {
    return res.status(400).json({ error: "menuIds manquants" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT m.id AS menu_id, t.id AS tag_id, t.name AS tag_name
       FROM "Menu" m
       JOIN "Tag" t ON t.id = m.tag_id
       WHERE m.id = ANY($1::int[])`,
      [menuIds]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erreur get-tags-for-menus:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ------------------- ADD RECIPE TO EXISTING MENU -------------------
router.post("/add-recipe", async (req, res) => {
  const { menu_id, recipe_id } = req.body;

  if (!menu_id || !recipe_id) {
    return res.status(400).json({ error: "menu_id et recipe_id sont requis" });
  }

  try {
    await pool.query(
      `INSERT INTO "menus_recipes" (menu_id, recipe_id)
       VALUES ($1, $2)
       ON CONFLICT (menu_id, recipe_id) DO NOTHING`,
      [menu_id, recipe_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur /menu/add-recipe:", err);
    res.status(500).json({ error: "Erreur serveur lors de l'ajout de la recette" });
  }
});

// ------------------- CREATE NEW MENU -------------------
router.post("/create", async (req, res) => {
  const { recipe_id, date, home_id, tag_id } = req.body;

  console.log("HERE", recipe_id, date, home_id, tag_id);

  if (!recipe_id || !date || !home_id || !tag_id) {
    return res.status(400).json({ error: "recipe_id, date tag_id et home_id sont requis" });
  }

  try {
    // Si tag_id non fourni, laisse null
    const menuTagId = tag_id || null;

    // 1️⃣ Crée le menu
    const result = await pool.query(
      `INSERT INTO "Menu" (datetime, home_id, tag_id)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [date, home_id, menuTagId]
    );
    const menuId = result.rows[0].id;

    // 2️⃣ Ajoute la recette
    await pool.query(
      `INSERT INTO "menus_recipes" (menu_id, recipe_id)
       VALUES ($1, $2)
       ON CONFLICT (menu_id, recipe_id) DO NOTHING`,
      [menuId, recipe_id]
    );

    res.json({ success: true, menuId });
  } catch (err) {
    console.error("Erreur /menu/create:", err);
    res.status(500).json({ error: "Erreur serveur lors de la création du menu" });
  }
});


import admin from "../firebase.js";

// 🔹 Envoi des notifications FCM avec tokens uniques
// 🔹 Fonction FCM sécurisée
async function sendFCMNotification(tokens, title, body) {
  if (!tokens || tokens.length === 0) return;

  // Unicité des tokens
  const uniqueTokens = [...new Set(tokens)];

  const message = {
    notification: { title, body },
    tokens: uniqueTokens,
  };

  console.log("Envoi notification FCM :", JSON.stringify(message, null, 2));

  const response = await admin.messaging().sendEachForMulticast(message);
  console.log("Réponse FCM :", response);
  return response;
}

/* ---------------------- SUBSCRIBE ---------------------- */
router.post("/subscribe", async (req, res) => {
  try {
    const { menuId, profileId } = req.body;
    if (!menuId || !profileId) {
      return res.status(400).json({ error: "menuId et profileId sont requis" });
    }

    // 🔹 Récupérer home_id du menu
    const menu = await pool.query(
      `SELECT "home_id" FROM "Menu" WHERE id = $1`,
      [menuId]
    );
    if (menu.rowCount === 0) {
      return res.status(404).json({ error: "Menu introuvable" });
    }
    const homeId = menu.rows[0].home_id;

    // 🔹 Ajouter l'association menu/profile (uniquement si nouvelle)
    const result = await pool.query(
      `INSERT INTO menus_profiles (menu_id, profile_id)
       VALUES ($1, $2)
       ON CONFLICT (menu_id, profile_id) DO NOTHING;`,
      [menuId, profileId]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "L'inscription a déjà été effectuée" });
    }

    // 🔹 Récupérer tous les tokens uniques pour cette maison
    const tokensResult = await pool.query(
      `
      SELECT DISTINCT p.push_token
      FROM "Profile" p
      INNER JOIN homes_profiles hp ON p.id = hp.profile_id
      WHERE hp.home_id = $1 
        AND p.push_token IS NOT NULL
        AND p.id <> $2
      `,
      [homeId, profileId] // exclure le profile courant
    );

    const tokens = tokensResult.rows.map(r => r.push_token);

    // 🔹 Envoyer notification seulement si nouvel abonnement
    if (tokens.length > 0) {
      await sendFCMNotification(
        tokens,
        "Nouvelle inscription",
        "Une mise à jour est disponible dans votre dashboard."
      );
    }

    res.json({ ok: true, notified: tokens.length });
  } catch (err) {
    console.error("❌ Erreur /subscribe:", err.stack);
    res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
  }
});

/* ---------------------- UNSUBSCRIBE ---------------------- */
router.post("/unsubscribe", async (req, res) => {
  try {
    const { menuId, profileId } = req.body;
    if (!menuId || !profileId) {
      return res.status(400).json({ error: "menuId et profileId sont requis" });
    }

    // 🔹 Récupérer home_id du menu
    const menu = await pool.query(
      `SELECT "home_id" FROM "Menu" WHERE id = $1`,
      [menuId]
    );
    if (menu.rowCount === 0) {
      return res.status(404).json({ error: "Menu introuvable" });
    }
    const homeId = menu.rows[0].home_id;

    // 🔹 Supprimer l'association menu/profile
    const result = await pool.query(
      `DELETE FROM menus_profiles WHERE menu_id = $1 AND profile_id = $2`,
      [menuId, profileId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Aucune inscription trouvée" });
    }

    // 🔹 Récupérer tous les tokens uniques pour cette maison
    // Récupération des tokens distincts pour la maison, sauf celui du profile courant
    const tokensResult = await pool.query(
      `
      SELECT DISTINCT p.push_token
      FROM "Profile" p
      INNER JOIN homes_profiles hp ON p.id = hp.profile_id
      WHERE hp.home_id = $1 
        AND p.push_token IS NOT NULL
        AND p.id <> $2
      `,
      [homeId, profileId] // exclure le profile courant
    );

    const tokens = tokensResult.rows.map(r => r.push_token);

    // Envoyer la notification seulement si tokens non vide
    if (tokens.length > 0) {
      await sendFCMNotification(
        tokens,
        "Désinscription",
        "Une mise à jour est disponible dans votre dashboard."
      );
    }

    res.json({ success: true, message: "Désinscription réussie", notified: tokens.length });
  } catch (err) {
    console.error("❌ Erreur /unsubscribe:", err.stack);
    res.status(500).json({ error: "Erreur serveur lors de la désinscription" });
  }
});





















// --- SAVE TOKEN (pour un seul token actif par profil) ---
router.post("/save-token", async (req, res) => {
  try {
    const { profileId, push_token } = req.body;
    if (!profileId || !push_token) return res.status(400).json({ error: "profileId et push_token requis" });

    // Remplacer le token existant pour ce profil
    await pool.query(
      `UPDATE "Profile" SET push_token = $1 WHERE id = $2`,
      [push_token, profileId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Erreur /save-token :", err.stack);
    res.status(500).json({ error: "Erreur serveur" });
  }
});





router.post("/checkSubscription", async (req, res) => {
  try {
    const { menuId, profileId } = req.body;

    // Vérification des paramètres
    if (!menuId || !profileId) {
      return res.status(400).json({ error: "menuId et profileId sont requis" });
    }

    // Vérification si l'utilisateur est déjà inscrit à ce menu
    const result = await pool.query(
      `SELECT 1 FROM menus_profiles WHERE menu_id = $1 AND profile_id = $2`,
      [menuId, profileId]
    );

    // Si l'utilisateur est inscrit, on retourne true
    if (result.rowCount > 0) {
      return res.json({ isSubscribed: true });
    }

    // Si l'utilisateur n'est pas inscrit
    res.json({ isSubscribed: false });
  } catch (err) {
    console.error("❌ Erreur lors de la vérification de l'abonnement:", err);
    res.status(500).json({ error: "Erreur serveur lors de la vérification de l'abonnement" });
  }
});

router.get("/getSubscribers", async (req, res) => {
  const { menuId } = req.query;

  if (!menuId) {
    return res.status(400).json({ error: "menuId est requis" });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT p.name
      FROM menus_profiles mp
      JOIN "Profile" p ON p.id = mp.profile_id
      WHERE mp.menu_id = $1
      ORDER BY p.name ASC;
      `,
      [menuId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Erreur /menu/get-subscribers:", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des inscrits" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const menuId = parseInt(req.params.id, 10);

  if (isNaN(menuId)) {
    return res.status(400).json({ error: "ID de menu invalide" });
  }

  try {
    // 4️⃣ Supprimer la recette
    await pool.query(
      `DELETE FROM "Menu" WHERE id = $1`,
      [menuId]
    );

    res.json({
      ok: true
    });

  } catch (e) {
    console.error("Erreur lors de la suppression :", e);
    res.status(500).json({ error: e.message });
  }
});


export default router;
