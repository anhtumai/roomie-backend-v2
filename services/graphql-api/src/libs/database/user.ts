import UserModel from "models/user";

export async function isUsernameAvailable(username: string) {
  const user = await UserModel.findOne({
    username,
  });
  return user === null || user === undefined;
}
