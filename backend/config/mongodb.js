import mongoose from "mongoose";

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) return;
  isConnecting = true;
  try {
    let uri = (process.env.MONGODB_URI || process.env.MONGO_URI || "").trim();
    uri = uri.replace(/^["']|["']$/g, "").trim();
    if (uri && !uri.endsWith("/appointy")) {
      uri = uri.replace(/\/+$/, "") + "/appointy";
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Database Connected");
  } catch (error) {
    console.error("Database connection error:", error.message);
    // Keep server process alive and retry in background
    setTimeout(() => {
      connectDB();
    }, 5000);
  } finally {
    isConnecting = false;
  }
};

export default connectDB;
