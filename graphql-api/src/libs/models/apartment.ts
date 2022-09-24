import mongoose from "mongoose";

export interface TaskDocument extends mongoose.Document {
  name: string;
  description: string;
  frequency: number;
  start: Date;
  end?: Date;
  assignees: string[];
  createdBy: string;
}

const taskSchema = new mongoose.Schema<TaskDocument>({
  name: {
    type: String,
    minlength: 5,
    required: true,
  },
  description: {
    type: String,
    minlength: 0,
    default: "",
    required: true,
  },
  frequency: {
    type: Number,
    min: 1,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    default: null,
    required: false,
  },
  assignees: [
    {
      type: String,
      ref: "User",
    },
  ],
  createdBy: {
    type: String,
    ref: "User",
  },
});

export interface ApartmentDocument extends mongoose.Document {
  name: string;
  tasks: TaskDocument[];
  members: {
    userId: string;
    role: "ADMIN" | "NORMAL";
  }[];
}

export interface MemberDocument {
  userId: string;
  role: "ADMIN" | "NORMAL";
}

const apartmentSchema = new mongoose.Schema<ApartmentDocument>({
  name: {
    type: String,
    minlength: 10,
    required: true,
  },
  tasks: [taskSchema],
  members: [
    {
      _id: false,
      userId: {
        type: String,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: ["ADMIN", "NORMAL"],
        default: "NORMAL",
        required: true,
      },
    },
  ],
});

const ApartmentModel = mongoose.model<ApartmentDocument>(
  "Apartment",
  apartmentSchema,
);

export default ApartmentModel;
