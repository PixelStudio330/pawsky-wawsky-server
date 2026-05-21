import mongoose, { Schema, Document } from "mongoose";

export interface IAdoptionRequest extends Document {
  petId: mongoose.Types.ObjectId;
  petName: string;
  petOwnerEmail: string;

  userName: string;
  userEmail: string;

  pickupDate: string;
  message: string;

  status: "pending" | "approved" | "rejected";

  createdAt: Date;
  updatedAt: Date;
}

const AdoptionRequestSchema = new Schema(
  {
    petId: {
      type: Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },

    petName: {
      type: String,
      required: true,
    },

    petOwnerEmail: {
      type: String,
      required: true,
    },

    userName: {
      type: String,
      required: true,
    },

    userEmail: {
      type: String,
      required: true,
    },

    pickupDate: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Helpful index for faster duplicate checks
AdoptionRequestSchema.index({
  petId: 1,
  userEmail: 1,
  status: 1,
});

export const AdoptionRequest =
  mongoose.models.AdoptionRequest ||
  mongoose.model<IAdoptionRequest>(
    "AdoptionRequest",
    AdoptionRequestSchema
  );