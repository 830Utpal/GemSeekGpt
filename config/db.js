import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("⚠️ MONGODB_URI is not defined in environment variables!");
}

// Global cache to prevent multiple connections in development
let cached = global._mongoose || { conn: null, promise: null };

async function connectDB() {
    if (cached.conn) {
        console.log("✅ Using existing MongoDB connection.");
        return cached.conn;
    }

    if (!cached.promise) {
        console.log("🔄 Connecting to MongoDB...");
        cached.promise = mongoose
            .connect(MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
                socketTimeoutMS: 45000, // Close sockets after 45 seconds
            })
            .then((mongoose) => {
                console.log("✅ MongoDB Connected Successfully.");
                return mongoose;
            })
            .catch((error) => {
                console.error("❌ MongoDB Connection Error:", error);
                cached.promise = null; // Reset promise to allow retries
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        console.error("❌ Connection failed, retrying...");
        throw error;
    }

    // Store cache globally in development mode
    if (process.env.NODE_ENV !== "production") {
        global._mongoose = cached;
    }

    return cached.conn;
}

export default connectDB;
