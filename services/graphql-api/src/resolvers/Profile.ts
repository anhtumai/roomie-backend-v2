import { validateToken } from "./validateToken";

import ApartmentModel from "@roomie-backend-v2/models/apartment";

async function getMyApartmentResolver(
  parent: {
    id: string;
    email: string;
    username: string;
    role: string;
    apartmentId?: string;
  },
  args: any,
  context: any,
  info: any,
) {
  const { apartmentId } = parent;

  if (apartmentId === undefined || apartmentId === null) {
    return null;
  }
  const apartment = await ApartmentModel.findById(apartmentId);
  if (apartment === null) {
    return null;
  }

  return {
    id: apartment._id,
    name: apartment.name,
  };
}

export default { apartment: getMyApartmentResolver };
