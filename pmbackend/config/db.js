const mongoose = require('mongoose');
const dns = require('dns').promises;

/**
 * MongoDB Connection Manager
 * Handles connection with retry logic and comprehensive error handling
 */
class DatabaseConnection {
  constructor() {
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
    this.isConnecting = false;
  }

  /**
   * Test DNS resolution for MongoDB Atlas
   */
  async testDNSResolution(uri) {
    try {
      // Extract cluster name from SRV URI
      if (uri.includes('mongodb+srv://')) {
        const match = uri.match(/mongodb\+srv:\/\/[^@]+@([^.]+)\./);
        if (match) {
          const clusterName = match[1];
          const srvDomain = `_mongodb._tcp.${clusterName}.mongodb.net`;
          console.log(`🔍 Testing DNS SRV record: ${srvDomain}`);
          
          const addresses = await dns.resolveSrv(srvDomain);
          console.log(`✅ DNS resolution successful: ${addresses.length} servers found`);
          addresses.forEach(addr => {
            console.log(`   → ${addr.name}:${addr.port}`);
          });
          return true;
        }
      }
      return true;
    } catch (error) {
      console.warn('⚠️  DNS resolution warning:', error.message);
      console.log('   This may indicate network issues with MongoDB Atlas');
      return false;
    }
  }

  /**
   * Connect to MongoDB with retry logic
   */
  async connect() {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      console.log('⏳ Connection already in progress, waiting...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return;
    }

    this.isConnecting = true;

    try {
      // Check if MONGODB_URI exists
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      console.log('\n📡 Attempting to connect to MongoDB...');

      // Hide credentials in logs for security
      const safeURI = this.hideCredentials(process.env.MONGODB_URI);
      console.log('🔗 Connection string:', safeURI);

      // Test DNS resolution for Atlas (optional, helps with debugging)
      await this.testDNSResolution(process.env.MONGODB_URI);

      // Connection options for Mongoose v7+
      const options = {
        serverSelectionTimeoutMS: 30000, // 30 seconds
        socketTimeoutMS: 45000, // 45 seconds
        connectTimeoutMS: 30000, // 30 seconds
        family: 4, // Use IPv4, skip trying IPv6
        maxPoolSize: 10,
        minPoolSize: 2,
        retryWrites: true,
        retryReads: true,
        // For MongoDB Atlas
        tls: true,
        tlsAllowInvalidCertificates: false,
      };

      // Connect to MongoDB
      const conn = await mongoose.connect(process.env.MONGODB_URI, options);

      this.retryCount = 0;
      this.isConnecting = false;

      console.log('\n✅ MongoDB Connected Successfully!');
      console.log('=' .repeat(40));
      console.log(`📊 Host: ${conn.connection.host}`);
      console.log(`🗄️  Database: ${conn.connection.name || 'task_manager'}`);
      console.log(`🔌 Port: ${conn.connection.port || 'default'}`);
      console.log(`📦 Models: ${Object.keys(conn.models).length}`);
      console.log('=' .repeat(40) + '\n');

      // Set up connection event handlers
      this.setupEventHandlers();

      return conn;

    } catch (error) {
      this.isConnecting = false;
      console.error('\n❌ MongoDB Connection Failed!');
      console.error(`Error: ${error.message}`);
      
      // Provide detailed troubleshooting based on error type
      this.provideTroubleshooting(error);
      
      // Retry logic
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`\n🔄 Retrying connection... (${this.retryCount}/${this.maxRetries})`);
        console.log(`⏱️  Waiting ${this.retryDelay / 1000} seconds...\n`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.connect();
      }
      
      // If all retries fail, throw error
      console.error('\n❌ All connection attempts failed');
      throw error;
    }
  }

  /**
   * Setup Mongoose connection event handlers
   */
  setupEventHandlers() {
    // Connection events
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connection established');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully');
    });

    mongoose.connection.on('reconnectFailed', () => {
      console.error('❌ MongoDB reconnection failed after all attempts');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Disconnect from MongoDB gracefully
   */
  async disconnect() {
    if (mongoose.connection.readyState === 1) {
      console.log('Disconnecting from MongoDB...');
      await mongoose.disconnect();
      console.log('MongoDB disconnected');
    }
  }

  /**
   * Hide credentials in connection string for logging
   */
  hideCredentials(uri) {
    try {
      return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    } catch {
      return 'Invalid URI format';
    }
  }

  /**
   * Provide troubleshooting tips based on error type
   */
  provideTroubleshooting(error) {
    const message = error.message;
    
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('─'.repeat(50));
    
    if (message.includes('querySrv ECONNREFUSED')) {
      console.log('📡 DNS Resolution Error:');
      console.log('   • This error occurs when MongoDB Atlas SRV record cannot be resolved');
      console.log('   • Try these fixes:');
      console.log('     1. Flush DNS cache:');
      console.log('        - Windows: ipconfig /flushdns');
      console.log('        - Mac: sudo dscacheutil -flushcache');
      console.log('        - Linux: sudo systemd-resolve --flush-caches');
      console.log('     2. Change DNS to Google (8.8.8.8)');
      console.log('     3. Use standard connection string instead of SRV');
      console.log('     4. Whitelist your IP in MongoDB Atlas Network Access');
    }
    else if (message.includes('bad auth') || message.includes('Authentication failed')) {
      console.log('🔐 Authentication Error:');
      console.log('   • Check username and password in connection string');
      console.log('   • Verify the user has proper database permissions');
      console.log('   • Make sure the database name is correct');
      console.log('   • Example: mongodb://username:password@host:27017/task_manager');
    }
    else if (message.includes('getaddrinfo') || message.includes('ENOTFOUND')) {
      console.log('🌐 Network/DNS Error:');
      console.log('   • Cannot resolve MongoDB hostname');
      console.log('   • Check your internet connection');
      console.log('   • Verify the hostname is correct');
      console.log('   • Try pinging the host: ping your-cluster.mongodb.net');
    }
    else if (message.includes('ETIMEDOUT') || message.includes('timeout')) {
      console.log('⏱️  Connection Timeout:');
      console.log('   • MongoDB server is not responding');
      console.log('   • Check firewall settings');
      console.log('   • For MongoDB Atlas, whitelist your IP address');
      console.log('   • Ensure MongoDB is running');
    }
    else if (message.includes('ECONNREFUSED')) {
      console.log('🔌 Connection Refused:');
      console.log('   • MongoDB might not be running');
      console.log('   • Start MongoDB:');
      console.log('     - Windows: net start MongoDB');
      console.log('     - Mac: brew services start mongodb-community');
      console.log('     - Linux: sudo systemctl start mongod');
      console.log('   • Check if port is correct (default: 27017)');
    }
    else if (message.includes('MONGODB_URI')) {
      console.log('📝 Configuration Error:');
      console.log('   • MONGODB_URI not found in .env file');
      console.log('   • Create .env file from .env.example');
      console.log('   • Add your MongoDB connection string');
    }
    else {
      console.log(`   • ${message}`);
      console.log('   • Check MongoDB connection string format');
      console.log('   • Verify MongoDB service is running');
    }
    
    console.log('\n📝 Common Connection String Formats:');
    console.log('   Local MongoDB:     mongodb://localhost:27017/task_manager');
    console.log('   Local with auth:   mongodb://username:password@localhost:27017/task_manager');
    console.log('   MongoDB Atlas:     mongodb+srv://username:password@cluster.xxxxx.mongodb.net/task_manager');
    console.log('─'.repeat(50));
  }

  /**
   * Get connection status
   */
  getStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      readyState: mongoose.connection.readyState,
      status: states[mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
      models: Object.keys(mongoose.models)
    };
  }
}

// Create and export singleton instance
const dbConnection = new DatabaseConnection();

// Export the connect function and the instance for status checks
module.exports = () => dbConnection.connect();
module.exports.dbConnection = dbConnection;