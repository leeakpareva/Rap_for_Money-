import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../server/src/config/database';
import { errorHandler } from '../server/src/middleware/errorHandler';

import authRoutes from '../server/src/routes/auth';
import userRoutes from '../server/src/routes/users';
import postRoutes from '../server/src/routes/posts';
import commentRoutes from '../server/src/routes/comments';
import livestreamRoutes from '../server/src/routes/livestreams';
import tipRoutes from '../server/src/routes/tips';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/livestreams', livestreamRoutes);
app.use('/api/tips', tipRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

export default app;