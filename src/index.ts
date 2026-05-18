import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import petRoutes from "./routes/petRoutes";

// Config environment variables
dotenv.config();

// Connect to MongoDB Cloud
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000" })); // Gives your Next.js app exclusive permission
app.use(express.json());

// Routes
app.use("/api/pets", petRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TypeScript Backend running on http://localhost:${PORT} 🚀`));