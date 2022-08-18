import { validateToken } from "./validateToken";

import { connectMongodb } from "@roomie-backend-v2/models/database";
import UserModel from "@roomie-backend-v2/models/user";

connectMongodb();

async function getMyProfileResolver(
  parent: any,
  args: any,
  context: any,
  info: any,
) {
  const jwtPayload = await validateToken(context.token);
  if (typeof jwtPayload === "string") {
    throw new Error("Invalid JWT Payload");
  }
  const user = await UserModel.findById(jwtPayload.sub);
  if (user === null) {
    throw new Error(`User with id ${jwtPayload.sub} not found`);
  }
  return {
    id: user.id,
    email: jwtPayload.email,
    username: user.username,
  };
}

export default { getMyProfile: getMyProfileResolver };
