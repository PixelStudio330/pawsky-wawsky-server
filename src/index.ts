import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db";
import petRoutes from "./routes/petRoutes";
import authRoutes from "./routes/authRoutes";

// Config environment variables
dotenv.config();

// Connect to MongoDB Cloud
connectDB();

const app = express();

// Middleware
app.use(
  cors({ 
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Allows easy shifting when deploying to Vercel
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
); 

app.use(express.json());
app.use(cookieParser()); // CRITICAL: Placed right before routes so cookies are ready to read!

// Routes
app.use("/api/pets", petRoutes);
app.use("/api/auth", authRoutes); // Registered secure authentication endpoints

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TypeScript Backend running on http://localhost:${PORT} 🚀`));