import mongoose from "mongoose";

const connectDB = async () => {
  try {
    let uri = (process.env.MONGODB_URI || process.env.MONGO_URI || "").trim();
    uri = uri.replace(/^["']|["']$/g, "").trim();
    if (uri && !uri.endsWith("/appointy")) {
      uri = uri.replace(/\/+$/, "") + "/appointy";
    }

    await mongoose.connect(uri);
    console.log("Database Connected");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
