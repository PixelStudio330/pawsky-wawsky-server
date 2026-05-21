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

// 🌐 Dynamic CORS configuration to support both Local Development and Production
const allowedOrigins = [
  "http://localhost:3000",
  "https://pawsky-wawsky-client.vercel.app"
];

app.use(
  cors({ 
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Insomnia, Postman, or server-to-server)
      if (!origin) return callback(null, true);
      
      // Check if the incoming request origin is explicitly whitelisted
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by Pawsky Wawsky CORS Security Policy"));
      }
    },
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
app.listen(PORT, () => console.log(`TypeScript Backend running on port ${PORT} 🚀`));