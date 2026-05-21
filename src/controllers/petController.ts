import { Request, Response } from "express";
import Pet from "../models/Pet";

// @desc    Get all public pets
export const getPets = async (req: Request, res: Response): Promise<void> => {
  try {
    const pets = await Pet.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: pets.length, data: pets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new pet entry (Private)
export const createPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerEmail = (req as any).user.email;
    const newPet = await Pet.create({ ...req.body, ownerEmail });
    res.status(201).json({ success: true, message: "Pet listed successfully! 🐾", data: newPet });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update a pet listing (Private - Owner Only)
export const updatePet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userEmail = (req as any).user.email;

    const pet = await Pet.findById(id);
    if (!pet || pet.ownerEmail !== userEmail) {
      res.status(403).json({ success: false, message: "Unauthorized: You do not own this pet." });
      return;
    }

    const updatedPet = await Pet.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: "Pet updated successfully! 🐾", data: updatedPet });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a pet listing (Private - Owner Only)
export const deletePet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userEmail = (req as any).user.email;

    const pet = await Pet.findById(id);
    if (!pet || pet.ownerEmail !== userEmail) {
      res.status(403).json({ success: false, message: "Unauthorized: You do not own this pet." });
      return;
    }

    await Pet.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Pet removed from sanctuary." });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get a single pet asset by ID
export const getPetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      res.status(404).json({ success: false, message: "Pet not found." });
      return;
    }
    res.status(200).json({ success: true, data: pet });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};