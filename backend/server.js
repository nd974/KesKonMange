import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";

import homeRoutes from "./routes/home.js";
import profileRoutes from "./routes/profile.js";
import tagRoutes from "./routes/tag.js";
import recipeRoutes from "./routes/recipe.js";
import menuRoutes from "./routes/menu.js";
import unitRoutes from "./routes/unit.js";
import utensilRoutes from "./routes/utensil.js";
import ingredientRoutes from "./routes/ingredient.js";
import storageRoutes from "./routes/storage.js";
import productRoutes from "./routes/product.js";
import nutritionRoutes from "./routes/nutrition.js";
import shopRoutes from "./routes/shops.js";
import notificationRoutes from "./routes/notifications.js";

import mailerRoutes from "./routes/mailer.js";

const app = express();

app.use(cors({
  origin: [
    "https://keskonmange-tan.vercel.app",
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
app.use("/unit", unitRoutes);
app.use("/utensil", utensilRoutes);
app.use("/ingredient", ingredientRoutes);
app.use("/storage", storageRoutes);
app.use("/product", productRoutes);
app.use("/nutrition", nutritionRoutes);
app.use("/shops", shopRoutes);
app.use("/notifications", notificationRoutes);

app.use("/mailer", mailerRoutes);

const PORT = process.env.PORT || 3000;

app.get("/ping", (req, res) => {
  res.status(200).send("p");
});

// import openfoodfactsRoutes from "./routes/api/openfoodfacts.js";
// app.use("/api/openfoodfacts", openfoodfactsRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
