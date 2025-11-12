export default async function handler(req, res) {
  try {
    await fetch("https://keskonmange.onrender.com"); // ← ton endpoint Render
    res.status(200).send("Ping sent");
  } catch (err) {
    console.error("Erreur ping backend:", err);
    res.status(500).send("Erreur ping backend");
  }
}