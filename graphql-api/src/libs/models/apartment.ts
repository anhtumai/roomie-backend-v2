import { Task, Apartment, MembershipRole } from "@dto/apartment";
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

export interface ApartmentDocument extends mongoose.Document {
  name: string;
  tasks: TaskDocument[];
  members: {
    userId: string;
    role: MembershipRole;
  }[];
}

export interface MemberDocument {
  userId: string;
  role: MembershipRole;
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

export function toTaskOutput(taskDocument: TaskDocument): Task {
  return {
    id: taskDocument._id,
    name: taskDocument.name,
    description: taskDocument.description,
    frequency: taskDocument.frequency,
    assignees: taskDocument.assignees,
    start: taskDocument.start.toISOString(),
    end: taskDocument.end?.toISOString(),
    createdBy: taskDocument.createdBy,
  };
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

export function toApartmentOutput(
  apartmentDocument: ApartmentDocument,
): Apartment {
  return {
    id: String(apartmentDocument._id),
    name: apartmentDocument.name,
    tasks: apartmentDocument.tasks.map(toTaskOutput),
    members: apartmentDocument.members,
  };
}
