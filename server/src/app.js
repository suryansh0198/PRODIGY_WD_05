import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDBStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';

dotenv.config();

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);

// Health check endpoint (includes database status)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'CommuteCast API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: getDBStatus(),
  });
});

// Root welcome
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CommuteCast API. Check /api/health for system status.',
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    requestedUrl: req.originalUrl,
  });
});

export default app;
