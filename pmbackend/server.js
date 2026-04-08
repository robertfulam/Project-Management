const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

const connectDB = require('./config/db');

const app = express();

// ============================================
// DATABASE CONNECTION
// ============================================
connectDB();

// ============================================
// CORS CONFIGURATION
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================
// Authentication routes
app.use('/api/auth', authRoutes);

// Category routes
app.use('/api/categories', categoryRoutes);

// Task routes
app.use('/api/tasks', taskRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// AI Assistant routes
app.use('/api/ai', aiRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Submission routes
app.use('/api/submissions', submissionRoutes);

// ============================================
// HEALTH CHECK ENDPOINTS
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
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbState[mongoose.connection.readyState] || 'unknown',
      readyState: mongoose.connection.readyState,
      name: mongoose.connection.name || 'not connected',
      host: mongoose.connection.host || 'not connected'
    }
  });
});

// ============================================
// HOME ROUTE - API Documentation
// ============================================
app.get('/', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  
  res.json({
    name: 'Task Manager API',
    version: '2.0.0',
    status: 'active',
    database: isDbConnected ? 'connected ✅' : 'disconnected ⚠️',
    serverTime: new Date().toISOString(),
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'PUT /api/auth/reset-password/:token',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'PUT /api/auth/change-password',
        deleteAccount: 'DELETE /api/auth/account',
        switchRole: 'GET /api/auth/switch-role'
      },
      categories: {
        getAll: 'GET /api/categories',
        getById: 'GET /api/categories/:id',
        create: 'POST /api/categories',
        update: 'PUT /api/categories/:id',
        delete: 'DELETE /api/categories/:id'
      },
      tasks: {
        getUserTasks: 'GET /api/tasks/user',
        getAllTasks: 'GET /api/tasks/all (admin only)',
        getById: 'GET /api/tasks/:id',
        create: 'POST /api/tasks',
        update: 'PUT /api/tasks/:id',
        complete: 'PUT /api/tasks/:id/complete',
        delete: 'DELETE /api/tasks/:id',
        assign: 'POST /api/tasks/assign (admin only)'
      },
      dashboard: {
        stats: 'GET /api/dashboard/stats',
        myTodo: 'GET /api/dashboard/mytodo',
        complete: 'GET /api/dashboard/complete',
        pending: 'GET /api/dashboard/pending',
        progress: 'GET /api/dashboard/progress'
      },
      ai: {
        chat: 'POST /api/ai/chat',
        summarize: 'POST /api/ai/summarize/:taskId',
        monetize: 'POST /api/ai/monetize/:taskId',
        analyzeFile: 'POST /api/ai/analyze-file',
        history: 'GET /api/ai/chats'
      },
      admin: {
        users: 'GET /api/admin/users',
        userById: 'GET /api/admin/users/:id',
        createUser: 'POST /api/admin/users',
        updateUser: 'PUT /api/admin/users/:id',
        deleteUser: 'DELETE /api/admin/users/:id',
        updateRole: 'PUT /api/admin/users/:id/role',
        assignTask: 'POST /api/admin/assign-task',
        submissions: 'GET /api/admin/submissions',
        reviewSubmission: 'PUT /api/admin/submissions/:id/review',
        stats: 'GET /api/admin/stats'
      },
      submissions: {
        create: 'POST /api/submissions',
        getUserSubmissions: 'GET /api/submissions/user',
        getById: 'GET /api/submissions/:id',
        update: 'PUT /api/submissions/:id',
        delete: 'DELETE /api/submissions/:id',
        upload: 'POST /api/submissions/upload',
        getAll: 'GET /api/submissions/admin/all (admin only)',
        review: 'PUT /api/submissions/admin/:id/review (admin only)',
        stats: 'GET /api/submissions/stats'
      }
    }
  });
});

// ============================================
// ERROR HANDLING
// ============================================
// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedUrl: req.originalUrl,
    method: req.method,
    availableEndpoints: 'GET / for API documentation'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    user: req.user?._id,
    timestamp: new Date().toISOString()
  });
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate value for ${field}. Please use another value.`,
      field: field
    });
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
      field: err.path
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired. Please login again.'
    });
  }
  
  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 50MB.'
    });
  }
  
  if (err.message === 'Invalid file type') {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Please upload a valid file.'
    });
  }
  
  // Default error response
  const statusCode = err.status || 500;
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    statusCode: statusCode
  };
  
  // Add stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 TASK MANAGER API SERVER');
  console.log('='.repeat(60));
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ⚠️'}`);
  console.log(`📅 Started: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60));
  console.log('\n✨ Server is ready to accept requests!\n');
  console.log('📋 Available API Endpoints:');
  console.log('   GET  /                    - API Documentation');
  console.log('   GET  /health              - Health Check');
  console.log('   POST /api/auth/register   - User Registration');
  console.log('   POST /api/auth/login      - User Login');
  console.log('   POST /api/auth/forgot-password - Forgot Password');
  console.log('   PUT  /api/auth/reset-password/:token - Reset Password');
  console.log('   GET  /api/tasks/user      - Get My Tasks');
  console.log('   POST /api/tasks           - Create Task');
  console.log('   POST /api/submissions     - Create Submission');
  console.log('   GET  /api/admin/users     - Get All Users (Admin)');
  console.log('   GET  /api/admin/stats     - Get Admin Stats (Admin)');
  console.log('\n💡 Tip: Use the root endpoint (/) for full API documentation\n');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
const shutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
  
  server.close(async () => {
    console.log('📡 HTTP server closed');
    
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close(false);
        console.log('💾 MongoDB connection closed');
      }
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error.message);
      process.exit(1);
    }
  });
  
  // Force close after timeout
  setTimeout(() => {
    console.error('⚠️  Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle process termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  // Don't exit in development, just log
  if (process.env.NODE_ENV === 'production') {
    shutdown('UNHANDLED_REJECTION');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  if (process.env.NODE_ENV === 'production') {
    shutdown('UNCAUGHT_EXCEPTION');
  }
});

module.exports = app;