import mongoose from "mongoose";

import { validateToken } from "graphqlApi/libs/validateToken";

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
  const user = await UserModel.findById(jwtPayload.sub);
  if (user === null) {
    throw new Error(`User with id ${jwtPayload.sub} not found`);
  }
  if (user.apartment !== undefined && user.apartment !== null) {
    throw new Error(`You already have an apartment`);
  }

  const apartment = await ApartmentModel.create({
    _id: new mongoose.Types.ObjectId(),
    name: args.name,
  });
  await UserModel.findOneAndUpdate(
    {
      _id: jwtPayload.sub,
    },
    { apartment: apartment._id, role: "ADMIN" },
  );
  return apartment;
}
