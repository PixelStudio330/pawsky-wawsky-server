import express from "express";
import { getPets, createPet, getPetById, updatePet, deletePet } from "../controllers/petController";
import { verifyToken, AuthenticatedRequest } from "../middleware/verifyToken";
import Pet from "../models/Pet";

const router = express.Router();

// --- 1. STATIC ROUTES MUST COME BEFORE DYNAMIC ROUTES ---
// This ensures /my-pets is matched before /:id
router.get("/my-pets", verifyToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ success: false, message: "Unauthorized: User info missing" });
    }

    // According to your Pet Model, the field is 'ownerEmail'
    const myPets = await Pet.find({ ownerEmail: req.user.email });
    
    res.status(200).json({ success: true, data: myPets });
  } catch (error: any) {
    console.error("Backend Error in /my-pets:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 2. PUBLIC ROUTES ---
router.get("/", getPets);

// --- 3. DYNAMIC ROUTES ---
// Must come after static routes
router.get("/:id", getPetById);

// --- 4. PRIVATE ROUTES ---
router.post("/", verifyToken, createPet);
router.put("/:id", verifyToken, updatePet);
router.delete("/:id", verifyToken, deletePet);

export default router;