import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db";
import petRoutes from "./routes/petRoutes";
import authRoutes from "./routes/authRoutes";
import adoptionRoutes from "./routes/adoptionRoutes"; // Import the new routes

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({ 
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
); 

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/pets", petRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/adoptions", adoptionRoutes); // Register adoption endpoints

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TypeScript Backend running on http://localhost:${PORT} 🚀`));