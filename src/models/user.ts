import mongoose, { Schema } from "mongoose";

interface UserDocument {
  name: string;
  email: string;
  passwordHash: string;
  isLogout: boolean;
  tokenVersion: number;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    isLogout: {
      type: Boolean,
      default: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const User = mongoose.model<UserDocument>("User", userSchema);
