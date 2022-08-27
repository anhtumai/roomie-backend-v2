import UserModel from "models/user";
import ApartmentModel from "models/apartment";

export { validateToken } from "./validateToken";

export async function findAndValidateUser(sub: string) {
  const user = await UserModel.findById(sub);
  if (user === null) {
    throw new Error(`User with id ${sub} not found`);
  }
  return user;
}

export async function findAndValidateApartment(apartmentId: string) {
  const apartment = await ApartmentModel.findById(apartmentId);
  if (apartment === null || apartment === undefined) {
    throw new Error(`Apartment with id ${apartmentId} not found`);
  }
  return apartment;
}

export function isValidDateString(dateString: any) {
  if (typeof dateString !== "string") {
    return false;
  }
  return String(new Date(dateString)) !== "Invalid Date";
}
