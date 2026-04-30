/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DATABASE CONNECTION CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Purpose: Establish connection to MongoDB database using Mongoose
 * 
 * Features:
 * - Connects to MongoDB Atlas (cloud) using connection string
 * - Handles DNS resolution issues with public DNS fallback
 * - Automatic error handling and logging
 * - Connection status reporting
 * 
 * Environment Variables Required:
 * - MONGO_URI: MongoDB connection string
 *   Format: mongodb+srv://username:password@cluster.mongodb.net/database
 *   Get from: MongoDB Atlas Dashboard > Connect > Connection String
 * 
 * DNS Workaround:
 * Some network configurations block SRV queries needed for mongodb+srv URIs.
 * This function sets Google's public DNS (8.8.8.8) as fallback to resolve this.
 */

const mongoose = require("mongoose");
const dns = require("dns");

/**
 * Connects to MongoDB database
 * 
 * @async
 * @function
 * @throws {Error} If connection fails, logs error and exits process
 * @returns {Promise<Connection>} MongoDB connection object
 * 
 * Usage in server.js:
 * const connectDB = require('./config/db');
 * await connectDB();
 */
const connectDB = async () => {
  try {
    // DNS RESOLUTION FIX
    // Force Node.js DNS resolver to use Google's public DNS (8.8.8.8)
    // This bypasses network restrictions that block SRV queries
    // SRV queries are required for mongodb+srv connection URIs
    try {
      dns.setServers(["8.8.8.8"]);
    } catch (e) {
      // If DNS setting fails, continue anyway - not critical
      // Connection might still work with default system DNS
    }

    // Establish connection to MongoDB using Mongoose
    // MONGO_URI should be in format: mongodb+srv://user:pass@cluster.mongodb.net/dbname
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log successful connection with host information
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log error message for debugging
    console.error(`Error: ${error.message}`);
    
    // Exit process with failure code (1)
    // This prevents server from running without database
    process.exit(1);
  }
};

module.exports = connectDB;
