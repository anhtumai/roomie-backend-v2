import { findAndValidateUser } from "graphqlApi/libs/validation";

export async function getUserFromMembershipResolver(
  parent: {
    userId: string;
    role: "ADMIN" | "NORMAL";
  },
  args: any,
  context: any,
  info: any,
) {
  //
  const user = await findAndValidateUser(parent.userId);
  return {
    id: user._id,
    username: user.username,
  };
}
