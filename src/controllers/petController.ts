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

// @desc    Get a single pet asset by ID
// @route   GET /api/pets/:id
// @access  Public
export const getPetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Search MongoDB for the document matching this specific Hex ID string
    const pet = await Pet.findById(id);

    if (!pet) {
      res.status(404).json({
        success: false,
        message: "The requested pet gem could not be found in the sanctuary."
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: pet
    });
  } catch (error: any) {
    // Catch invalid ObjectId formatting errors safely
    if (error.kind === "ObjectId") {
      res.status(400).json({
        success: false,
        message: "Invalid Pet ID formatting style structure."
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error exploring pet profile records.",
      error: error.message
    });
  }
};