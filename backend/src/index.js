import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import reportsRoutes from './routes/reports.js';
import usersRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// console.log(process.env.MONGODB_URl);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bhunirakshak';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Set JWT_SECRET globally for the auth routes
process.env.JWT_SECRET = JWT_SECRET;

console.log('Using MongoDB URI:', MONGODB_URI);
console.log('JWT Secret:', JWT_SECRET ? 'Set' : 'Not set');
console.log('Frontend URL:', FRONTEND_URL);

// Enhanced CORS configuration
app.use(cors({ 
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/', (_req, res) => {
  res.json({ 
    status: 'ok', 
    name: 'Bhu-Nirakshak API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API routes
console.log('Mounting auth routes at /api/auth');
app.use('/api/auth', authRoutes);
console.log('Mounting reports routes at /api/reports');
app.use('/api/reports', reportsRoutes);
console.log('Mounting users routes at /api/users');
app.use('/api/users', usersRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(3000, () => {
      console.log(`🚀 API server running on http://localhost:3000`);
      console.log(`📱 Frontend URL: ${FRONTEND_URL}`);
      console.log(`🔗 API Base URL: http://localhost:3000/api`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
