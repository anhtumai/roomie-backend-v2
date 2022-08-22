import { validateToken } from "./validateToken";

import { connectMongodb } from "@roomie-backend-v2/models/database";
import UserModel from "@roomie-backend-v2/models/user";

connectMongodb();

async function updateMyProfileResolver(
  parent: any,
  args: any,
  context: any,
  info: any,
) {
  console.log("Args", args);
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
  console.log("User after update", user);
  return {
    id: user.id,
    email: jwtPayload.email,
    username: user.username,
  };
}

export default { updateMyProfile: updateMyProfileResolver };
