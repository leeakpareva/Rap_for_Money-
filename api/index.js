const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Simple User schema for testing
const userSchema = new mongoose.Schema({
  username: String,
  displayName: String,
  email: String,
  passwordHash: String,
  bio: String,
  location: String,
  profileImageUrl: String,
  socialLinks: {
    link1: String,
    link2: String
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Database connection
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Routes
app.get('/api/health', async (req, res) => {
  try {
    await connectToDatabase();
    res.json({
      status: 'OK',
      message: 'API is running',
      mongoConnected: mongoose.connection.readyState === 1,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Database connection failed',
      error: error.message,
      mongoConnected: false
    });
  }
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Rap for Money API',
    version: '1.0.0',
    endpoints: ['/api/health']
  });
});

// Test endpoint to verify database connection
app.get('/api/test-db', async (req, res) => {
  try {
    await connectToDatabase();
    const userCount = await User.countDocuments();
    res.json({
      status: 'Database connected',
      userCount,
      mongoConnected: mongoose.connection.readyState === 1
    });
  } catch (error) {
    res.status(500).json({
      status: 'Database error',
      error: error.message,
      mongoConnected: false
    });
  }
});

// Catch all for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    availableEndpoints: ['/api', '/api/health', '/api/test-db']
  });
});

module.exports = app;