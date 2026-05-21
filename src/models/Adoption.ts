import mongoose, { Schema, Document } from 'mongoose';

export interface IAdoptionRequest extends Document {
  petId: mongoose.Types.ObjectId;
  petName: string;
  petOwnerEmail: string; // ADD THIS
  userName: string;
  userEmail: string;
  pickupDate: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdoptionRequestSchema = new Schema({
  petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
  petName: { type: String, required: true },
  petOwnerEmail: { type: String, required: true }, // ADD THIS
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  pickupDate: { type: String, required: true },
  message: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

export const AdoptionRequest = mongoose.model<IAdoptionRequest>('AdoptionRequest', AdoptionRequestSchema);