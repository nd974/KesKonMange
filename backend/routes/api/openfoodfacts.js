import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const fetchWithTimeout = (url, ms = 1200) =>
  Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout " + url)), ms)
    )
  ]);

router.get("/", async (req, res) => {
  try {
    const queryFR = req.query.q;
    if (!queryFR) return res.status(400).json({ error: "Missing query" });

    const queryEN = queryFR.toLowerCase() === "pomme de terre" ? "potato" : queryFR;

    const urls = [
      `https://world.openfoodfacts.org/cgi/search.pl?action=process&search_terms=${encodeURIComponent(queryFR)}&search_simple=1&json=1`,
      `https://us.openfoodfacts.org/cgi/search.pl?action=process&search_terms=${encodeURIComponent(queryEN)}&search_simple=1&json=1`
    ];

    let dataFR = { products: [] };
    let dataEN = { products: [] };

    try {
      const resFR = await fetchWithTimeout(urls[0]);
      dataFR = await resFR.json();
    } catch (e) {
      console.warn("⚠️ OFF FR timeout");
    }

    try {
      const resEN = await fetchWithTimeout(urls[1]);
      dataEN = await resEN.json();
    } catch (e) {
      console.warn("⚠️ OFF US timeout : ignoré");
    }

    const extractNames = (list) =>
      list
        .map(p => p.product_name || p.generic_name || p.ingredients_text || null)
        .filter(n => typeof n === "string" && n.trim() !== "")
        .map(n => n.trim());

    const namesFR = extractNames(dataFR.products || []);
    const namesEN = extractNames(dataEN.products || []).filter(n => !namesFR.includes(n));

    const suggestions = [...new Set([...namesFR, ...namesEN])];

    res.json(suggestions);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
