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

export async function rejectInvitationResolver(
  parent: any,
  args: {
    id: string;
  },
  context: any,
  info: any,
) {
  const jwtPayload = await validateToken(context.token);

  const invitationId = args.id;

  const invitation = await InvitationModel.findById(invitationId);
  if (invitation === null || invitation === undefined) {
    throw new Error(`Invitation with id ${invitationId} not found`);
  }
  if (jwtPayload.sub !== invitation.invitee) {
    throw new Error("This invitation is not for you to reject");
  }

  await InvitationModel.deleteOne({
    _id: invitationId,
  });

  const [inviter, invitee, apartment] = await Promise.all([
    await UserModel.findById(invitation.inviter),
    await UserModel.findById(invitation.invitee),
    await ApartmentModel.findById(invitation.apartment),
  ]);
  return {
    id: invitationId,
    inviter: {
      id: inviter!._id,
      username: inviter!.username,
      email: jwtPayload.email,
      role: inviter!.role,
      apartmentId: inviter?.apartment?.toString(),
    },
    invitee: {
      id: jwtPayload.sub,
      username: invitee!.username,
      email: jwtPayload.email,
      role: invitee!.role,
    },
    apartment: {
      id: invitation.apartment,
      name: apartment?.name ?? "Apartment not found",
    },
  };
}

export async function acceptInvitationResolver(
  parent: any,
  args: {
    id: string;
  },
  context: any,
  info: any,
) {
  const jwtPayload = await validateToken(context.token);

  const invitationId = args.id;

  const invitation = await InvitationModel.findById(invitationId);
  if (invitation === null || invitation === undefined) {
    throw new Error(`Invitation with id ${invitationId} not found`);
  }
  if (jwtPayload.sub !== invitation.invitee) {
    throw new Error("This invitation is not for you to accept");
  }

  const [inviter, invitee, apartment] = await Promise.all([
    await UserModel.findById(invitation.inviter),
    await UserModel.findById(invitation.invitee),
    await ApartmentModel.findById(invitation.apartment),
  ]);

  if (invitee === null || invitee === undefined) {
    throw new Error(`User with id ${invitation.invitee} not found`);
  }
  if (invitee.apartment !== null || invitee.role !== "FREE") {
    throw new Error("You aleady have an apartment");
  }

  if (apartment === null || apartment === undefined) {
    throw new Error("Cannot find apartment");
  }

  // Transaction
  await UserModel.findByIdAndUpdate(invitee._id, {
    apartment: apartment._id,
    role: "NORMAL",
  });
  await InvitationModel.deleteOne({ _id: invitation._id });

  return {
    id: invitation.apartment,
    name: apartment?.name ?? "Apartment not found",
  };
}
