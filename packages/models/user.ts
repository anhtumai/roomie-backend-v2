import mongoose from "mongoose";

export interface UserDocument extends mongoose.Document {
  username: string;
  role: string;
  apartment?: mongoose.Schema.Types.ObjectId;
}

const userSchema = new mongoose.Schema<UserDocument>({
  _id: {
    type: String,
  },
  username: {
    type: String,
    minlength: 3,
    unique: true,
    required: true,
  },
  role: {
    type: String,
    enum: ["ADMIN", "NORMAL", "FREE"],
    default: "FREE",
    required: false,
  },
  apartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Apartment",
    default: null,
    required: false,
  },
});

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
