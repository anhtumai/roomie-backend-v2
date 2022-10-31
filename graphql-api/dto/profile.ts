import { Apartment } from "./apartment";

export type Profile = {
  id: string;
  username: string;
  email: string;
  apartmentId?: string;
  apartment?: Apartment;
};
