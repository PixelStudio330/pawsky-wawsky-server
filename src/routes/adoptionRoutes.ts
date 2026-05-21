import express from "express";
import { createAdoptionRequest, updateRequestStatus, deleteRequest } from "../controllers/adoptionController";
import { verifyToken, AuthenticatedRequest } from "../middleware/verifyToken"; 
import { AdoptionRequest } from "../models/Adoption";

const router = express.Router();

router.post("/", verifyToken, createAdoptionRequest);

router.get("/my-applications", verifyToken, async (req: AuthenticatedRequest, res: any) => {
  const myRequests = await AdoptionRequest.find({ userEmail: req.user?.email });
  res.status(200).json({ success: true, data: myRequests });
});

router.get("/my-received-requests", verifyToken, async (req: AuthenticatedRequest, res: any) => {
  const receivedRequests = await AdoptionRequest.find({ petOwnerEmail: req.user?.email });
  res.status(200).json({ success: true, data: receivedRequests });
});

router.patch("/:id", verifyToken, updateRequestStatus);
router.delete("/:id", verifyToken, deleteRequest);

export default router;