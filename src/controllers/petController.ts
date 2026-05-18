import { Request, Response } from "express";
import Pet from "../models/Pet";

// @desc    Get all listed pets (Public)
// @route   GET /api/pets
export const getPets = async (req: Request, res: Response): Promise<void> => {
  try {
    const pets = await Pet.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: pets.length, data: pets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new pet entry (Private Dashboard)
// @route   POST /api/pets
export const createPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const newPet = await Pet.create(req.body);
    res.status(201).json({ success: true, message: "Pet baby listed successfully! 🐾", data: newPet });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};