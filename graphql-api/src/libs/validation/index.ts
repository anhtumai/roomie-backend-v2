import mongoose from "mongoose";

import UserModel, { UserDocument } from "@models/user";
import ApartmentModel, { ApartmentDocument } from "@models/apartment";

export { validateFirebaseIdToken } from "./validateToken";

export async function findAndValidateUser(sub: string) {
  const user = await UserModel.findById(sub);
  if (user === null) {
    throw new Error(`User with id ${sub} not found`);
  }
  return user;
}

export async function findAndValidateApartment(
  apartmentId: string | mongoose.Schema.Types.ObjectId,
) {
  const apartment = await ApartmentModel.findById(apartmentId);
  if (apartment === null || apartment === undefined) {
    throw new Error(`Apartment with id ${apartmentId} not found`);
  }
  return apartment;
}

function isValidDateString(dateString: string) {
  return String(new Date(dateString)) !== "Invalid Date";
}
export function validateDateString(dateString: any) {
  if (!isValidDateString(dateString)) {
    throw new Error(
      `${dateString} is not a valid date string. It should be ISO format.`,
    );
  }
}

export function validateAdminRole(
  apartment: ApartmentDocument,
  user: UserDocument,
) {
  const membership = apartment.members.find(
    (member) => member.userId === user._id,
  );
  if (membership?.role !== "ADMIN") {
    throw new Error(`User ${user.username} does not have ADMIN permission`);
  }
}
