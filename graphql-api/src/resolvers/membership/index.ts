import { ShortProfile } from "@dto/shortProfile";

import { findAndValidateUser } from "@validation";

import { MemberDocument } from "@models/apartment";

export async function getUserFromMembershipResolver(
  parent: MemberDocument,
  args: any,
  context: any,
  info: any,
): Promise<ShortProfile> {
  const user = await findAndValidateUser(parent.userId);
  return {
    id: user._id,
    username: user.username,
  };
}
