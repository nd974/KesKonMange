import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

console.log("[DB_HOST]:", process.env.DB_HOST);
console.log("[DB_USER]:", process.env.DB_USER);
console.log("[DB_PASSWORD]:", process.env.DB_PASSWORD);
console.log("[DB_NAME]:", process.env.DB_NAME);
console.log("[DB_PORT]:", process.env.DB_PORT);

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
    "https://keskonmange-942bbo70j-nd974s-projects.vercel.app", //met pas le "/"
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
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
