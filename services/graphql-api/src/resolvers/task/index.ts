import { validateToken } from "@roomie-backend-v2/graphql-api/src/libs/validateToken";

import UserModel from "@roomie-backend-v2/models/user";

export async function createTaskResolver(
  parent: any,
  args: {
    name: string;
    description: string;
    frequency: number;
  },
  context: any,
  info: any,
) {
  console.log("Parent", parent);
  const jwtPayload = await validateToken(context.token);
  const user = await UserModel.findById(jwtPayload.sub);
  if (user === null) {
    throw new Error(`User with id ${jwtPayload.sub} not found`);
  }
  if (user.apartment !== undefined && user.apartment !== null) {
    throw new Error(`You already have an apartment`);
  }
  return {
    id: "1",
    name: "2",
    description: "3",
    frequency: 4,
  };
}
