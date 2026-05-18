import mongoose, { Schema, model, models } from "mongoose";

export interface IAdoption {
  _id?: string;
  petId: mongoose.Types.ObjectId;
  petName: string;
  userName: string;
  userEmail: string;
  pickupDate: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
}

const AdoptionSchema = new Schema<IAdoption>(
  {
    petId: { type: Schema.Types.ObjectId, ref: "Pet", required: true },
    petName: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    pickupDate: { type: String, required: true },
    message: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
  },
  { timestamps: true }
);

const Adoption = models.Adoption || model<IAdoption>("Adoption", AdoptionSchema);

export default Adoption;