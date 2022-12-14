import mongoose from "mongoose";

export interface UserDocument extends mongoose.Document {
  _id: string;
  username: string;
  apartment?: mongoose.Schema.Types.ObjectId;
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

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
