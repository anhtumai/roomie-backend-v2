import mongoose from "mongoose";

import config from "./config";

export interface UserDocument extends mongoose.Document {
  _id: string;
  username: string;
  apartment?: mongoose.Schema.Types.ObjectId;
}

export function connectMongodb() {
  mongoose
    .connect(config.MONGODB_URI)
    .then(() => console.log("Connect to MongoDB successfully"))
    .catch((err) => console.error(err));
}

const userSchema = new mongoose.Schema<UserDocument>({
  _id: {
    type: String,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    minlength: 3,
    required: true,
  },
  apartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Apartment",
    default: null,
    required: false,
  },
});

export const UserModel = mongoose.model<UserDocument>("User", userSchema);
