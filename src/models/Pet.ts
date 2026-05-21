import mongoose, { Schema, Document } from "mongoose";

export interface IPet extends Document {
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: "Male" | "Female" | "Unknown";
  image: string;
  healthStatus: string;
  vaccinationStatus: string;
  location: string;
  adoptionFee: number;
  description: string;
  ownerEmail: string;

  // ✅ ADD THIS
  status: "available" | "pending" | "adopted";

  createdAt: Date;
  updatedAt: Date;
}

const PetSchema: Schema = new Schema(
  {
    name: { type: String, required: true },

    species: { type: String, required: true },

    breed: { type: String, required: true },

    age: { type: String, required: true },

    gender: {
      type: String,
      enum: ["Male", "Female", "Unknown"],
      required: true,
    },

    image: { type: String, required: true },

    healthStatus: { type: String, required: true },

    vaccinationStatus: { type: String, required: true },

    location: { type: String, required: true },

    adoptionFee: {
      type: Number,
      required: true,
      default: 0,
    },

    description: { type: String, required: true },

    ownerEmail: {
      type: String,
      required: true,
    },

    // ✅ THIS IS THE IMPORTANT PART
    status: {
      type: String,
      enum: ["available", "pending", "adopted"],
      default: "available",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Pet ||
  mongoose.model<IPet>("Pet", PetSchema);