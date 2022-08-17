import mongoose from "mongoose";

export interface UserDocument extends mongoose.Document {
  username: string;
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
});

userSchema.set("toJSON", {
  transform: (document: any, returnedObject: UserDocument) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
