import { validateToken, findAndValidateUser } from "graphqlApi/libs/validation";

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
  const user = await findAndValidateUser(jwtPayload.sub);
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
