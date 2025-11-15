import express from "express";
import fetch from "node-fetch"; // si Node <18, sinon global fetch

const router = express.Router();

// GET /api/openfoodfacts?q=farine
router.get("/", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing query" });

    const url = `https://world.openfoodfacts.org/cgi/suggest.pl?tagtype=ingredients&string=${encodeURIComponent(query)}&json=1&lc=fr`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data); // renvoie directement un array de suggestions
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;