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
// Connect to MongoDB with error handling
connectDB().catch(err => {
  console.error('❌ Database connection failed:', err.message);
  console.log('⚠️  Server will continue without database connection');
  console.log('   Some endpoints may not work until database is connected\n');
});

// ============================================
// MIDDLEWARE
// ============================================
// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsers with increased limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url}`);
    next();
  });
}

// Response time header
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️  ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// ============================================
// ROUTES
// ============================================
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
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
  
  const readyState = mongoose.connection.readyState;
  
  res.status(200).json({
    status: 'OK',
    server: 'running',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbState[readyState] || 'unknown',
      readyState: readyState,
      name: mongoose.connection.name || 'not connected',
      host: mongoose.connection.host || 'not connected'
    },
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// ============================================
// HOME ROUTE
// ============================================
app.get('/', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  
  res.json({
    name: 'Task Manager API',
    version: '1.0.0',
    status: 'active',
    database: isDbConnected ? 'connected ✅' : 'disconnected ⚠️',
    serverTime: new Date().toISOString(),
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      categories: {
        list: 'GET /api/categories',
        create: 'POST /api/categories',
        update: 'PUT /api/categories/:id',
        delete: 'DELETE /api/categories/:id'
      },
      tasks: {
        list: 'GET /api/tasks/all',
        myTasks: 'GET /api/tasks/user',
        create: 'POST /api/tasks',
        update: 'PUT /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id',
        complete: 'PUT /api/tasks/:id/complete'
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
        history: 'GET /api/ai/chats',
        assess: 'POST /api/ai/assess/:submissionId'
      },
      admin: {
        assignTask: 'POST /api/admin/assign-task',
        submissions: 'GET /api/admin/submissions',
        review: 'PUT /api/admin/submissions/:id/review',
        users: 'GET /api/admin/users',
        stats: 'GET /api/admin/stats'
      },
      submissions: {
        create: 'POST /api/submissions',
        list: 'GET /api/submissions/user',
        upload: 'POST /api/submissions/upload',
        update: 'PUT /api/submissions/:id'
      }
    },
    documentation: 'https://github.com/yourusername/task-manager-api',
    support: 'support@taskmanager.com'
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
    availableEndpoints: '/ for API information'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  // Log error with details
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
  console.log('\n' + '='.repeat(50));
  console.log('🚀 TASK MANAGER API SERVER');
  console.log('='.repeat(50));
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database Status: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ⚠️'}`);
  console.log(`📅 Started: ${new Date().toLocaleString()}`);
  console.log('='.repeat(50));
  console.log('\n✨ Server is ready to accept requests!\n');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
const shutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
  
  // Close server first
  server.close(async () => {
    console.log('📡 HTTP server closed');
    
    // Close database connection
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
  // Don't crash in development, but log it
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