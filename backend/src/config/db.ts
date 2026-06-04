import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO URI is not defined");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Mongo Connection is successful");
  } catch (error) {
    console.log("Error while connection with database", error);
    process.exit(1);
  }
};
