import mongoose from "mongoose";

export interface InvitationDocument extends mongoose.Document {
  inviter: mongoose.Schema.Types.ObjectId;
  invitee: mongoose.Schema.Types.ObjectId;
  apartment: mongoose.Schema.Types.ObjectId;
}

const invitationSchema = new mongoose.Schema<InvitationDocument>({
  inviter: {
    type: String,
    ref: "User",
    required: true,
  },
  invitee: {
    type: String,
    ref: "User",
    required: true,
  },
  apartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Apartment",
    required: true,
  },
});

const InvitationModel = mongoose.model<InvitationDocument>(
  "Invitation",
  invitationSchema,
);

export default InvitationModel;
