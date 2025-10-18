import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  appointmentDateTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  reason: string;
}

const appointmentSchema = new Schema<IAppointment>({
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentDateTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  reason: { type: String }
}, { timestamps: true });

export default mongoose.model<IAppointment>('Appointment', appointmentSchema);
