import UserModel from "models/user";

import { validateToken } from "graphqlApi/libs/validation";

export async function getMyProfileResolver(
  parent: any,
  args: any,
  context: any,
  info: any,
) {
  const jwtPayload = await validateToken(context.token);
  const user = await UserModel.findById(jwtPayload.sub);
  if (user === null) {
    throw new Error(`User with id ${jwtPayload.sub} not found`);
  }
  return {
    id: user.id,
    email: jwtPayload.email,
    username: user.username,
    role: user.role,
    apartmentId: user.apartment?.toString(),
  };
}

export async function updateMyProfileResolver(
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

export async function checkUsernameAvailableResolver(
  parent: any,
  args: {
    username: string;
  },
  context: any,
  info: any,
) {
  const user = await UserModel.findOne({
    username: args.username,
  });
  return user === null || user === undefined;
}
