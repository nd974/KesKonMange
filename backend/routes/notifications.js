import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/get", async (req, res) => {
  const { home_id, profile_id } = req.query;

  if (!home_id || !profile_id) {
    return res.status(400).json({
      error: "home_id et profile_id sont requis"
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         id,
         subject,
         body,
         link,
         read,
         date_create
       FROM profiles_notifications
       WHERE home_id = $1
         AND profile_id = $2
       ORDER BY date_create DESC`,
      [home_id, profile_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET /notifications error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "id requis" });

  try {
    await pool.query(
      `DELETE FROM profiles_notifications WHERE id = $1`,
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /notifications/:id error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/read", async (req, res) => {
  const { id } = req.body;

  if (!id) return res.status(400).json({ error: "id requis" });

  try {
    await pool.query(
      `UPDATE profiles_notifications
       SET read = true
       WHERE id = $1`,
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("POST /notifications/read error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export async function createMenuNotifications({ pool, home_id, date, menuTagId }) {
    
  const profilesResult = await pool.query(
    `SELECT profile_id
     FROM homes_profiles
     WHERE home_id = $1`,
    [home_id]
  );

  console.log("sssssssssssssssssssssssssssssssss=", profilesResult);

  const subject = `Nouveau menu – ${date} [${menuTagId}]`;
  const body = `Bonjour,

Un nouveau menu a été proposé pour le ${date}.

Merci de confirmer votre participation.`;

  for (const row of profilesResult.rows) {
    console.log("d=", row.profile_id);
    await pool.query(
    `INSERT INTO profiles_notifications
        (profile_id, home_id, subject, body, link)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (profile_id, home_id, link) DO NOTHING`,
    [
        row.profile_id,
        home_id,
        subject,
        body,
        `/calendar/${date}`
    ]
    );
  }
}

export default router;
