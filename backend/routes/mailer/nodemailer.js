import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "keskonmange.tan.vercel.app@gmail.com",//process.env.MAIL_USER,
    pass: "scsc nkqe prqj whtl",//process.env.MAIL_PASS,
    replyTo: "contact@keskonmange.com",
  },
});

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_URL = "http://localhost:3000";

export async function sendVerificationEmail(email, token) {
  const link = `${API_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"KesKonMange" <keskonmange.tan.vercel.app@gmail.com>`,
    to: email,
    subject: "Confirmation de votre adresse e-mail",
    html: `
        <p>Bonjour,</p>

        <p>
        Vous avez récemment modifié votre adresse e-mail.
        Pour confirmer que cette adresse vous appartient, merci de cliquer sur le lien ci-dessous :
        </p>

        <p>
        <a href="${link}">Confirmer mon adresse e-mail</a>
        </p>

        <p>
        Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer ce message.
        </p>

        <p style="font-size:12px;color:#777;">
        Keskonmange – Paramètres du compte
        </p>

    `,
  });
}

import express from "express";
import { pool } from "../../db.js";

const router = express.Router();

router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("Token manquant");
    }

    const { rows } = await pool.query(
      `
      SELECT id FROM "Profile"
      WHERE email_verification_token = $1
        AND email_verification_expires > NOW()
      `,
      [token]
    );

    if (!rows.length) {
      return res.status(400).send("Lien invalide ou expiré");
    }

    await pool.query(
      `
      UPDATE "Profile"
      SET email_check = true,
          email_verification_token = NULL,
          email_verification_expires = NULL
      WHERE id = $1
      `,
      [rows[0].id]
    );

    // 🔁 redirection front
    res.redirect(`${process.env.FRONT_URL}/settings/security?verified=1`);
  } catch (e) {
    res.status(500).send("Erreur serveur");
  }
});

export default router;