import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctor extends Document {
  userId: mongoose.Types.ObjectId;
  specialization: string;
  availableSlots: string[];
  experience: string;
  contactInfo: string;
}

const doctorSchema = new Schema<IDoctor>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: { type: String, required: true },
  availableSlots: [{ type: String }],
  experience: { type: String },
  contactInfo: { type: String }
}, { timestamps: true });

export default mongoose.model<IDoctor>('Doctor', doctorSchema);
