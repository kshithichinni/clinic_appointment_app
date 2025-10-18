import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import doctorRoutes from './routes/doctorRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import userRoutes from './routes/userRoutes'; // ✅ NEW - Import userRoutes
import errorHandler from './middleware/errorHandler';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ Register all routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes); // ✅ ADD THIS for profile view/edit

// Root route
app.get('/', (_req, res) => {
  res.send('Clinic Appointment App API is running 🚀');
});

// ✅ Keep error handler last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
