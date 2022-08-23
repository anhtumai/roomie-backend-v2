import { validateToken } from "./validateToken";

import UserModel from "@roomie-backend-v2/models/user";

async function getMyProfileResolver(
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

export default { getMyProfile: getMyProfileResolver };
