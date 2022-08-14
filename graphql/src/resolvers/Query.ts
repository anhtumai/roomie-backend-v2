import { validateToken } from "./validateToken";

async function getMyProfile(parent: any, args: any, context: any, info: any) {
  const x = await validateToken(context.token);
  console.log("JWT payload", x);
  console.log("Context", context);
  return {};
}

export default { getMyProfile };
