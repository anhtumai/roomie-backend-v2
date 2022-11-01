import { Apartment } from "./apartment";
import { ShortProfile } from "./shortProfile";

export type Invitation = {
  id: string;
  invitee: ShortProfile;
  inviter: ShortProfile;
  apartment: Apartment;
};
