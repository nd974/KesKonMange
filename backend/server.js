import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

console.log("[DB_HOST]:", process.env.DB_HOST);
console.log("[DB_USER]:", process.env.DB_USER);
console.log("[DB_PASSWORD]:", process.env.DB_PASSWORD);
console.log("[DB_NAME]:", process.env.DB_NAME);
console.log("[DB_PORT]:", process.env.DB_PORT);

import express from "express";
import cors from "cors";
import menuRoutes from "./routes/menu.js";
import homeRoutes from "./routes/home.js";

const app = express();

app.use(cors({
  origin: ["https://https://keskonmange-4ittcv1v8-nd974s-projects.vercel.app/", "http://localhost:5173"], // Ton FRONT en prod
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.options('*', cors()); // pour toutes les routes

app.use(express.json());

app.use("/menu", menuRoutes);
app.use("/home", homeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
