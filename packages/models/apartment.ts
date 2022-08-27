import mongoose from "mongoose";

export interface TaskDocument extends mongoose.Document {
  name: string;
  description: string;
  frequency: number;
  assignees: mongoose.Schema.Types.ObjectId[];
  createdBy: mongoose.Schema.Types.ObjectId;
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
  assignees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export interface ApartmentDocument extends mongoose.Document {
  name: string;
  tasks: TaskDocument[];
}

const apartmentSchema = new mongoose.Schema<ApartmentDocument>({
  name: {
    type: String,
    minlength: 10,
    required: true,
  },
  tasks: [taskSchema],
});

const ApartmentModel = mongoose.model<ApartmentDocument>(
  "Apartment",
  apartmentSchema,
);

export default ApartmentModel;
