import mongoose from "mongoose";

let cached = global.mongoose || { conn: null, promise: null };

export default async function connectDB() {
    if (cached.conn) return cached.conn; // FIXED: Use `cached.conn` instead of `cached.connection`

    if (!cached.promise) {
        console.log("Connecting to MongoDB...");
        cached.promise = mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then((mongoose) => {
            console.log("Connected to MongoDB!");
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new Error("Failed to connect to MongoDB"); // FIXED: Throw error so app doesn't continue with a broken DB connection
    }

    return cached.conn;
}
