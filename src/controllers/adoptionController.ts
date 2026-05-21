import { Request, Response } from "express";
import { AdoptionRequest } from "../models/Adoption";
import Pet from "../models/Pet";

// Applicant: Submit a request
export const createAdoptionRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = (req as any).user.email;
    const userName = (req as any).user.name; // Ensure your verifyToken attaches the user name
    
    const newRequest = await AdoptionRequest.create({ 
      ...req.body, 
      userEmail,
      userName
    });
    res.status(201).json({ success: true, data: newRequest });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Owner: Update status and handle adoption logic
export const updateRequestStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userEmail = (req as any).user.email;

    const request = await AdoptionRequest.findById(id);
    if (!request) {
      res.status(404).json({ success: false, message: "Request not found" });
      return;
    }

    if (request.petOwnerEmail !== userEmail) {
      res.status(403).json({ success: false, message: "Unauthorized: You do not own this pet" });
      return;
    }

    request.status = status;
    await request.save();

    // If approved, you might want to mark the pet as adopted
    if (status === 'approved') {
      await Pet.findByIdAndUpdate(request.petId, { status: 'Adopted' });
    }

    res.status(200).json({ success: true, message: `Request ${status} successfully!`, data: request });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Common: Delete/Withdraw request
export const deleteRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userEmail = (req as any).user.email;

    const request = await AdoptionRequest.findById(id);
    if (request && request.userEmail === userEmail) {
      await AdoptionRequest.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: "Application withdrawn." });
    } else {
      res.status(403).json({ success: false, message: "Unauthorized or request not found" });
    }
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};