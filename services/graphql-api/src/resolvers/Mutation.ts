import mongoose from "mongoose";

import { validateToken } from "./validateToken";

import { connectMongodb } from "@roomie-backend-v2/models/database";
import UserModel from "@roomie-backend-v2/models/user";
import ApartmentModel from "@roomie-backend-v2/models/apartment";

async function updateMyProfileResolver(
  parent: any,
  args: {
    username: string;
  },
  context: any,
  info: any,
) {
  const jwtPayload = await validateToken(context.token);
  const user = await UserModel.findOneAndUpdate(
    {
      _id: jwtPayload.sub,
    },
    {
      username: args.username,
    },
    { new: true },
  );
  if (user === null) {
    throw new Error(`User with id ${jwtPayload.sub} not found`);
  }
  return {
    id: user.id,
    email: jwtPayload.email,
    username: user.username,
  };
}

async function createApartmentResolver(
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

export default {
  updateMyProfile: updateMyProfileResolver,
  createApartment: createApartmentResolver,
};
