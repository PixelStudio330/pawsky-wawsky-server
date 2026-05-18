import express from "express";
import { getPets, createPet, getPetById } from "../controllers/petController";

const router = express.Router();

// Root path endpoints tracking /api/pets
router.route("/")
  .get(getPets)
  .post(createPet);

// 📌 Dynamic parameter path endpoints tracking /api/pets/:id
router.route("/:id")
  .get(getPetById);

export default router;