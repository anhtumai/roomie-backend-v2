import mongoose from "mongoose";

export interface TaskDocument extends mongoose.Document {
  name: string;
  description: string;
  frequency: number;
  assignees: mongoose.Schema.Types.ObjectId[];
  createdBy: mongoose.Schema.Types.ObjectId;
}

const taskSchema = new mongoose.Schema<TaskDocument>({
  _id: String,
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

taskSchema.set("toJSON", {
  transform: (document: any, returnedObject: TaskDocument) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export interface ApartmentDocument extends mongoose.Document {
  name: string;
  tasks: TaskDocument[];
}

const apartmentSchema = new mongoose.Schema<ApartmentDocument>({
  _id: {
    type: String,
  },
  name: {
    type: String,
    minlength: 10,
    required: true,
  },
  tasks: [taskSchema],
});

apartmentSchema.set("toJSON", {
  transform: (document: any, returnedObject: ApartmentDocument) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const ApartmentModel = mongoose.model<ApartmentDocument>(
  "User",
  apartmentSchema,
);

export default ApartmentModel;
