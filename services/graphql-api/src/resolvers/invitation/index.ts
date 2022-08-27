import mongoose from "mongoose";

import UserModel from "models/user";
import ApartmentModel from "models/apartment";
import InvitationModel from "models/invitation";

import { validateToken } from "graphqlApi/libs/validateToken";

export async function inviteResolver(
  parent: any,
  args: {
    username: string;
  },
  context: any,
  info: any,
) {
  const jwtPayload = await validateToken(context.token);
  const inviter = await UserModel.findById(jwtPayload.sub);
  if (inviter === null) {
    throw new Error(`User with id ${jwtPayload.sub} not found`);
  }
  if (inviter.apartment === null || inviter.apartment === undefined) {
    throw new Error(`User ${inviter.username} does not have an apartment`);
  }
  if (inviter.role !== "ADMIN") {
    throw new Error(
      `User ${inviter.username} does not have permission to invite other person`,
    );
  }

  const apartment = await ApartmentModel.findById(inviter.apartment);
  if (apartment === null || apartment === undefined) {
    throw new Error("Cannot find apartment");
  }

  const invitee = await UserModel.findOne({ username: args.username });
  if (invitee === null) {
    throw new Error(`User ${args.username} does not exist`);
  }
  if (invitee.apartment !== null || invitee.role !== "FREE") {
    throw new Error(`User ${args.username} already has an apartment`);
  }

  console.log("Debug 0", inviter._id, typeof inviter._id);

  const checkedInvitation = await InvitationModel.findOne({
    invitee: invitee._id,
    apartment: inviter.apartment,
  });
  if (checkedInvitation !== null) {
    throw new Error(
      `An invitation has already been sent to this user ${args.username}`,
    );
  }

  console.log("Debug 1", inviter._id, typeof inviter._id);

  const newInvitation = await InvitationModel.create({
    inviter: inviter._id,
    invitee: invitee._id,
    apartment: inviter.apartment,
  });

  return {
    id: newInvitation._id,
    inviter: {
      id: inviter._id,
      username: inviter.username,
      email: jwtPayload.email,
      role: inviter.role,
      apartmentId: inviter.apartment?.toString(),
    },
    invitee: {
      id: invitee._id,
      username: invitee.username,
      role: invitee.role,
    },
    apartment: {
      id: apartment._id,
      name: apartment.name,
    },
  };
}
