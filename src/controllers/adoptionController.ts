import { Request, Response } from "express";
import { AdoptionRequest } from "../models/Adoption";
import Pet from "../models/Pet";

// ==============================
// Applicant: Submit Request
// ==============================
export const createAdoptionRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userEmail = (req as any).user?.email;

    const {
      petId,
      petOwnerEmail,
      userName,
      pickupDate,
      message,
    } = req.body;

    // ==============================
    // Find Pet
    // ==============================
    const pet = await Pet.findById(petId);

    if (!pet) {
      res.status(404).json({
        success: false,
        message: "Pet not found 🐾",
      });
      return;
    }

    // ==============================
    // Owner cannot adopt own pet
    // ==============================
    if (userEmail === petOwnerEmail) {
      res.status(400).json({
        success: false,
        message:
          "You cannot adopt your own sanctuary listing 🔒",
      });
      return;
    }

    // ==============================
    // Block adopted pets
    // ==============================
    if (pet.status === "adopted") {
      res.status(400).json({
        success: false,
        message:
          "This precious gem has already been adopted 🏡",
      });
      return;
    }

    // ==============================
    // Prevent duplicate requests
    // ==============================
    const existingRequest = await AdoptionRequest.findOne({
      petId,
      userEmail,
      status: "pending",
    });

    if (existingRequest) {
      res.status(400).json({
        success: false,
        message:
          "You already have a pending adoption request for this pet ⏳",
      });
      return;
    }

    // ==============================
    // Create Adoption Request
    // ==============================
    const newRequest = await AdoptionRequest.create({
      petId,
      petName: pet.name,
      petOwnerEmail,
      userName:
        userName ||
        (req as any).user?.name ||
        userEmail?.split("@")[0] ||
        "Cozy Adopter",
      userEmail,
      pickupDate,
      message,
      status: "pending",
    });

    // ==============================
    // Change pet status to pending
    // ONLY if currently available
    // ==============================
    if (pet.status === "available") {
      pet.status = "pending";
      await pet.save();
    }

    res.status(201).json({
      success: true,
      message: "Adoption request submitted successfully ✨",
      data: newRequest,
    });
  } catch (error: any) {
    console.error("Create Adoption Request Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ==============================
// Owner: Approve / Reject Request
// ==============================
export const updateRequestStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const userEmail = (req as any).user.email;

    // ==============================
    // Find Request
    // ==============================
    const request = await AdoptionRequest.findById(id);

    if (!request) {
      res.status(404).json({
        success: false,
        message: "Request not found",
      });
      return;
    }

    // ==============================
    // Verify owner
    // ==============================
    if (request.petOwnerEmail !== userEmail) {
      res.status(403).json({
        success: false,
        message:
          "Unauthorized: You do not own this pet",
      });
      return;
    }

    // ==============================
    // Find Pet
    // ==============================
    const pet = await Pet.findById(request.petId);

    if (!pet) {
      res.status(404).json({
        success: false,
        message: "Pet not found",
      });
      return;
    }

    // ==============================
    // Update request status
    // ==============================
    request.status = status;
    await request.save();

    // ==============================
    // APPROVED LOGIC
    // ==============================
    if (status === "approved") {
      // Pet becomes adopted
      pet.status = "adopted";
      await pet.save();

      // Reject all OTHER pending requests
      await AdoptionRequest.updateMany(
        {
          petId: request.petId,
          _id: { $ne: request._id },
          status: "pending",
        },
        {
          status: "rejected",
        }
      );
    }

    // ==============================
    // REJECTED LOGIC
    // ==============================
    if (status === "rejected") {
      // Check if other pending requests exist
      const remainingPendingRequests =
        await AdoptionRequest.countDocuments({
          petId: request.petId,
          status: "pending",
        });

      // If none left -> available again
      if (remainingPendingRequests === 0) {
        pet.status = "available";
        await pet.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully!`,
      data: request,
    });
  } catch (error: any) {
    console.error("Update Request Status Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ==============================
// Delete / Withdraw Request
// ==============================
export const deleteRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const userEmail = (req as any).user.email;

    const request = await AdoptionRequest.findById(id);

    if (!request) {
      res.status(404).json({
        success: false,
        message: "Request not found",
      });
      return;
    }

    // ==============================
    // Only applicant can delete
    // ==============================
    if (request.userEmail !== userEmail) {
      res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const pet = await Pet.findById(request.petId);

    await AdoptionRequest.findByIdAndDelete(id);

    // ==============================
    // Restore availability if needed
    // ==============================
    if (pet) {
      const remainingPendingRequests =
        await AdoptionRequest.countDocuments({
          petId: request.petId,
          status: "pending",
        });

      if (
        remainingPendingRequests === 0 &&
        pet.status !== "adopted"
      ) {
        pet.status = "available";
        await pet.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Application withdrawn successfully 🕊️",
    });
  } catch (error: any) {
    console.error("Delete Request Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};