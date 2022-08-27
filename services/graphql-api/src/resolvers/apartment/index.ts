import { validateToken, findAndValidateUser } from "graphqlApi/libs/validation";

import UserModel from "models/user";
import ApartmentModel from "models/apartment";

export async function getApartmentFromProfileResolver(
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

export async function createApartmentResolver(
  parent: any,
  args: {
    name: string;
  },
  context: any,
  info: any,
) {
  const jwtPayload = await validateToken(context.token);
  const user = await findAndValidateUser(jwtPayload.sub);

  if (user.apartment !== undefined && user.apartment !== null) {
    throw new Error(`You already have an apartment`);
  }

  const apartment = await ApartmentModel.create({
    name: args.name,
    members: [
      {
        userId: user._id,
        role: "ADMIN",
      },
    ],
  });
  await UserModel.findOneAndUpdate(
    {
      _id: jwtPayload.sub,
    },
    { apartment: apartment._id },
  );
  return apartment;
}
