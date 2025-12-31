import mongoose from "mongoose";

let isConnected = false; // Variable to track the connection status
let listenersAdded = false; // Variable to track if event listeners are already added

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  // Check if MongoDB URL is provided
  const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;
  
  if (!mongoUrl) {
    throw new Error("MONGODB_URL or MONGODB_URI environment variable is not defined");
  }

  // In serverless environments, check if already connected
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("Already connected to MongoDB");
    return;
  }

  try {
    // Increase max listeners to prevent warnings in serverless environments
    if (mongoose.connection.maxListeners < 20) {
      mongoose.connection.setMaxListeners(20);
    }

    // Add event listeners only once (check if already attached)
    if (!listenersAdded && mongoose.connection.listenerCount("error") === 0) {
      // Handle connection events
      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
        isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected");
        isConnected = false;
      });

      listenersAdded = true;
    }

    // Connect to MongoDB with timeout and better error handling
    await mongoose.connect(mongoUrl, {
      dbName: "threads", // Optional: specify database name
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      connectTimeoutMS: 10000, // 10 seconds connection timeout
    });

    isConnected = true;
    console.log("MongoDB connected successfully");

  } catch (error: any) {
    console.error("Error connecting to MongoDB:", error);
    isConnected = false;
    
    // Provide more helpful error messages
    let errorMessage = error.message || "Unknown error";
    
    if (errorMessage.includes("IP") || errorMessage.includes("whitelist")) {
      errorMessage = "MongoDB connection failed: IP address not whitelisted. Please add Vercel IP addresses to your MongoDB Atlas IP whitelist. See: https://www.mongodb.com/docs/atlas/security-whitelist/";
    } else if (errorMessage.includes("authentication")) {
      errorMessage = "MongoDB connection failed: Authentication error. Please check your MongoDB credentials.";
    } else if (errorMessage.includes("timeout")) {
      errorMessage = "MongoDB connection failed: Connection timeout. Please check your network and MongoDB Atlas settings.";
    }
    
    throw new Error(`Failed to connect to MongoDB: ${errorMessage}`);
  }
};

