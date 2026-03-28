const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

// Import database connection
const connectDB = require('./config/db');

const app = express();

// ============================================
// DATABASE CONNECTION
// ============================================
connectDB().catch(err => {
  console.error('❌ Database connection failed:', err.message);
});

// ============================================
// CORS CONFIGURATION - FIXED FOR MULTIPLE ORIGINS
// ============================================
// List of allowed origins
const allowedOrigins = [
  'http://localhost:3000',   // React default
  'http://localhost:5173',   // Vite default
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.FRONTEND_URL
].filter(Boolean);

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Add CORS headers manually as a backup
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
  });
}

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/submissions', submissionRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  const dbState = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.status(200).json({
    status: 'OK',
    server: 'running',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins: allowedOrigins,
      currentOrigin: req.headers.origin
    },
    database: {
      status: dbState[mongoose.connection.readyState] || 'unknown',
      readyState: mongoose.connection.readyState
    }
  });
});

// ============================================
// HOME ROUTE
// ============================================
app.get('/', (req, res) => {
  res.json({
    name: 'Task Manager API',
    version: '1.0.0',
    status: 'active',
    cors: {
      allowedOrigins: allowedOrigins,
      message: 'CORS configured to accept multiple origins'
    },
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      dashboard: '/api/dashboard',
      categories: '/api/categories',
      admin: '/api/admin'
    }
  });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedUrl: req.originalUrl
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS error: Origin not allowed',
      allowedOrigins: allowedOrigins
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 9000;

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 TASK MANAGER API SERVER');
  console.log('='.repeat(60));
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Allowed Origins:`);
  allowedOrigins.forEach(origin => {
    if (origin) console.log(`   - ${origin}`);
  });
  console.log(`💾 Database: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ⚠️'}`);
  console.log('='.repeat(60));
  console.log('\n✨ Server is ready to accept requests!\n');
});

module.exports = app;