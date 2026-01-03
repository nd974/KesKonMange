// sendVerificationEmail.js
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const NODE_API_URL = process.env.NODE_API_URL || "http://localhost:3000";


/**
 * Envoyer un mail de vérification d'adresse email
 * @param {string} email - adresse email de l'utilisateur
 * @param {string} token - token de vérification
 */
export async function sendVerificationEmail(email, token) {
  try {
    const link = `${NODE_API_URL}/mailer/verify-email?token=${token}`;

    const msg = {
      to: email,
      from: {
        name: "KesKonMange",
        email: process.env.SENDGRID_MAIL, // doit être vérifié dans SendGrid
      },
      subject: "Confirmez votre adresse e-mail",
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
    };

    await sgMail.send(msg);
    console.log("Mail de vérification envoyé à", email);
  } catch (err) {
    console.error("Erreur envoi mail SendGrid:", err.response?.body || err);
    throw err;
  }
}
