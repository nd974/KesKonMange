import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";
import homeRoutes from "./routes/home.js";
import profileRoutes from "./routes/profile.js";
import tagRoutes from "./routes/tag.js";
import recipeRoutes from "./routes/recipe.js";
import menuRoutes from "./routes/menu.js";

const app = express();

app.use(cors({
  origin: [
    "https://keskonmange-tan.vercel.app", //ne pas mettre le "/"
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());


app.use("/home", homeRoutes);
app.use("/profile", profileRoutes);
app.use("/tag", tagRoutes);
app.use("/recipe", recipeRoutes);
app.use("/menu", menuRoutes);

const PORT = process.env.PORT || 3000;

app.get("/ping", (req, res) => {
  res.status(200).send("p");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
