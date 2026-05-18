import express from "express";
import { getPets, createPet } from "../controllers/petController";

const router = express.Router();

router.route("/")
  .get(getPets)
  .post(createPet);

export default router;