const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

// YugabyteDB connection configuration
// Based on: https://docs.yugabyte.com/preview/develop/drivers-orms/nodejs/

// Get CA certificate from environment variable or file
const getCACertificate = () => {
  // Option 1: From environment variable (for Vercel/production)
  if (process.env.YUGABYTE_CA_CERT) {
    console.log("Using CA certificate from environment variable");
    return process.env.YUGABYTE_CA_CERT.replace(/\\n/g, "\n");
  }

  // Option 2: From file (for local development)
  const certPath = path.join(__dirname, "../certs/root.crt");
  if (fs.existsSync(certPath)) {
    console.log("Using CA certificate from file:", certPath);
    return fs.readFileSync(certPath).toString();
  }

  // Option 3: No certificate (will use system CA or fail)
  console.warn("No CA certificate found. Connection may fail.");
  return undefined;
};

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.YUGABYTE_HOST || "your-cluster.aws.yugabyte.cloud",
  port: process.env.YUGABYTE_PORT || 5433,
  database: process.env.YUGABYTE_DB || "yugabyte",
  username: process.env.YUGABYTE_USER || "admin",
  password: process.env.YUGABYTE_PASSWORD,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: process.env.NODE_ENV === "production", // Disable in dev if no cert
      ca: getCACertificate(),
    },
  },
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Create database if it doesn't exist
const createDatabaseIfNotExists = async () => {
  const dbName = process.env.YUGABYTE_DB || "yugabyte";

  // If using default database, no need to create
  if (dbName === "yugabyte") {
    return;
  }

  // Connect to default database to create our database
  const { Sequelize } = require("sequelize");
  const defaultSequelize = new Sequelize({
    dialect: "postgres",
    host: process.env.YUGABYTE_HOST,
    port: process.env.YUGABYTE_PORT,
    database: "yugabyte", // Connect to default database
    username: process.env.YUGABYTE_USER,
    password: process.env.YUGABYTE_PASSWORD,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: process.env.NODE_ENV === "production",
        ca: getCACertificate(),
      },
    },
    logging: false,
  });

  try {
    // Check if database exists
    const [results] = await defaultSequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
    );

    if (results.length === 0) {
      // Database doesn't exist, create it
      console.log(`📦 Creating database '${dbName}'...`);
      await defaultSequelize.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully`);
    } else {
      console.log(`✅ Database '${dbName}' already exists`);
    }

    await defaultSequelize.close();
  } catch (error) {
    console.error("Error creating database:", error.message);
    await defaultSequelize.close();
    throw error;
  }
};

// Test connection
const testConnection = async () => {
  try {
    // First, ensure database exists
    await createDatabaseIfNotExists();

    // Then test connection to our database
    await sequelize.authenticate();
    console.log("✅ YugabyteDB connection established successfully");
    return true;
  } catch (error) {
    console.error("❌ Unable to connect to YugabyteDB:", error.message);
    return false;
  }
};

// Sync all models (create tables if they don't exist)
const syncDatabase = async () => {
  try {
    console.log("🔄 Starting database synchronization...");
    console.log("📋 Models to sync:", Object.keys(sequelize.models));

    // Use logging: console.log to see SQL queries
    console.log("⚙️  Syncing with alter: true (this may take a moment)...");

    // Use alter: false to prevent hanging on constraints
    // Tables are already created, just ensure they exist
    await sequelize.sync({
      alter: false, // Don't try to modify existing tables
      force: false, // Don't drop tables
      logging: (sql) => console.log("🔍 SQL:", sql),
    });

    console.log("✅ Database synchronized successfully");
    console.log("📊 Tables created/updated:", Object.keys(sequelize.models).length);
  } catch (error) {
    console.error("❌ Error synchronizing database:", error.message);
    console.error("❌ Full error:", error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  Sequelize,
};
