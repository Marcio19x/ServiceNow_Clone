import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import ticketRoutes from './routes/ticketRoutes';
import commentRoutes from './routes/commentRoutes';
import { authMiddleware, AuthRequest } from './middleware/auth';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tickets', commentRoutes);

// Protected route example
app.get('/api/dashboard', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({
    message: 'Protected Dashboard',
    user: req.user
  });
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});