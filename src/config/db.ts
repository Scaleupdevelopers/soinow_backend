import mongoose from "mongoose";
import { MONGO_URI } from "./environment";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI as string);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Unable to connect to MongoDB", error);
    throw error;
  }
};

export default connectDB;
