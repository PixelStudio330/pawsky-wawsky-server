import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db";

import petRoutes from "./routes/petRoutes";
import authRoutes from "./routes/authRoutes";
import adoptionRoutes from "./routes/adoptionRoutes";

dotenv.config();
connectDB();

const app = express();

/* ─────────────────────────────
   CORS CONFIG (SAFE MODE)
───────────────────────────── */
const allowedOrigins = [
  "http://localhost:3000",
  "https://pawsky-wawsky-client.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked CORS:", origin);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

/* ─────────────────────────────
   CORE MIDDLEWARE
───────────────────────────── */
app.use(express.json());
app.use(cookieParser());

/* ─────────────────────────────
   ROUTES
───────────────────────────── */
app.use("/api/pets", petRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/adoptions", adoptionRoutes);


/* ─────────────────────────────
   HEALTH CHECK (IMPORTANT)
───────────────────────────── */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Pawsky API is alive 🐾",
  });
});

/* ─────────────────────────────
   START SERVER
───────────────────────────── */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🐾 Wishlist route mounted at /api/wishlist`);
});