import { Profile } from "@dto/profile";

import UserModel from "@models/user";

import { validateFirebaseIdToken } from "@validation";

export async function getMyProfileResolver(
  _parent: any,
  _args: any,
  context: any,
  _info: any,
): Promise<Profile> {
  const jwtPayload = await validateFirebaseIdToken(context.token);
  const user = await UserModel.findById(jwtPayload.sub);
  if (user === null) {
    throw new Error(`User with id ${jwtPayload.sub} not found`);
  }
  return {
    id: user.id,
    email: jwtPayload.email,
    username: user.username,
    apartmentId: user.apartment?.toString(),
  };
}

export async function updateMyProfileResolver(
  _parent: any,
  args: {
    username: string;
  },
  context: any,
  _info: any,
): Promise<Profile> {
  const jwtPayload = await validateFirebaseIdToken(context.token);
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
