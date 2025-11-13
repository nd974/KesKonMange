import express from "express";
import fetch from "node-fetch"; // si Node <18, sinon global fetch fonctionne

const router = express.Router();

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;

// routes/api/edamam.js
router.get("/", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing query" });

    const url = `https://api.edamam.com/api/food-database/v2/parser?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(query)}&nutrition-type=cooking`;

    const response = await fetch(url);
    const data = await response.json();

    const suggestions = data.hints?.map(hint => hint.food.label) || [];
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;