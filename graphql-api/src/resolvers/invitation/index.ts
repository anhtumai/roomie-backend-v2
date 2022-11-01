import { Invitation } from "@dto/invitation";

import UserModel, { UserDocument } from "@models/user";
import ApartmentModel from "@models/apartment";
import InvitationModel from "@models/invitation";

import { firebaseAuth } from "../../libs/firebase";

import {
  validateFirebaseIdToken,
  findAndValidateUser,
  findAndValidateApartment,
  validateAdminRole,
} from "@validation";

type ShortProfile = {
  id: string;
  username: string;
};

type ResponseInvitation = {
  id: string;
  invitee: ShortProfile;
  inviter: ShortProfile;
  apartment: {
    id: string;
    name: string;
    tasks: [];
    members: [];
  };
};

function validateNotHavingApartment(invitee: UserDocument) {
  if (invitee.apartment !== null) {
    throw new Error(`User ${invitee.username} already has an apartment`);
  }
}

async function findAndValidateInvitation(
  invitationId: string,
  inviteeId: string,
) {
  const invitation = await InvitationModel.findById(invitationId);
  if (invitation === null || invitation === undefined) {
    throw new Error(`Invitation with id ${invitationId} not found`);
  }
  if (inviteeId !== invitation.invitee) {
    throw new Error("This invitation is not for you to reject or accept");
  }
  return invitation;
}

export async function getMyInvitationsResolver(
  _parent: any,
  _args: any,
  context: any,
  _info: any,
): Promise<Invitation[]> {
  const jwtPayload = await validateFirebaseIdToken(context.token);
  const invitee = await findAndValidateUser(jwtPayload.sub);
  const invitations = await InvitationModel.find({
    invitee: jwtPayload.sub,
  });
  const responseInvitations: ResponseInvitation[] = await Promise.all(
    invitations.map(async (invitation) => {
      const [inviter, apartment] = await Promise.all([
        await UserModel.findById(invitation.inviter),
        await ApartmentModel.findById(invitation.apartment),
      ]);
      return {
        id: invitation._id.toString(),
        invitee: {
          id: invitee.id,
          username: invitee.username,
        },
        inviter: {
          id: invitation.inviter,
          username: inviter?.username ?? "Unknown Inviter",
        },
        apartment: {
          id: invitation.apartment.toString(),
          name: apartment?.name ?? "Unknown Apartment",
          tasks: [],
          members: [],
        },
      };
    }),
  );
  return responseInvitations;
}

export async function inviteResolver(
  _parent: any,
  args: {
    email: string;
  },
  context: any,
  _info: any,
): Promise<boolean> {
  const jwtPayload = await validateFirebaseIdToken(context.token);
  const inviter = await findAndValidateUser(jwtPayload.sub);
  if (inviter.apartment === null || inviter.apartment === undefined) {
    throw new Error(`User ${inviter.username} does not have an apartment`);
  }

  const apartment = await findAndValidateApartment(inviter.apartment);
  validateAdminRole(apartment, inviter);

  const invitedUser = await firebaseAuth.getUserByEmail(args.email);

  const invitee = await findAndValidateUser(invitedUser.uid);
  if (invitee.apartment !== undefined && invitee.apartment !== null) {
    console.error(
      `User with email ${args.email} cannot be invited. User with that email may not have been registered or already has an apartment.`,
    );
    return true;
  }

  const newInvitation = await InvitationModel.create({
    inviter: inviter._id,
    invitee: invitee._id,
    apartment: inviter.apartment,
  });
  console.info("Create new invitation", newInvitation);
  return true;
}

export async function rejectInvitationResolver(
  _parent: any,
  args: {
    id: string;
  },
  context: any,
  _info: any,
): Promise<Invitation> {
  const jwtPayload = await validateFirebaseIdToken(context.token);

  const invitee = await findAndValidateUser(jwtPayload.sub);

  const invitation = await findAndValidateInvitation(args.id, invitee._id);

  await InvitationModel.deleteOne({
    _id: invitation._id,
  });

  const [inviter, apartment] = await Promise.all([
    await UserModel.findById(invitation.inviter),
    await findAndValidateApartment(invitation.apartment),
  ]);
  return {
    id: invitation._id,
    inviter: {
      id: invitation.inviter,
      username: inviter?.username ?? "Unknown Inviter",
    },
    invitee: {
      id: invitee._id,
      username: invitee.username,
    },
    apartment: {
      id: String(invitation.apartment),
      name: apartment.name,
      tasks: [],
      members: [],
    },
  };
}

export async function acceptInvitationResolver(
  _parent: any,
  args: {
    id: string;
  },
  context: any,
  _info: any,
): Promise<Invitation> {
  const jwtPayload = await validateFirebaseIdToken(context.token);

  const invitee = await findAndValidateUser(jwtPayload.sub);

  const invitation = await findAndValidateInvitation(args.id, invitee._id);

  const [inviter, apartment] = await Promise.all([
    await UserModel.findById(invitation.inviter),
    await findAndValidateApartment(invitation.apartment.toString()),
  ]);

  validateNotHavingApartment(invitee);

  // Transaction
  await UserModel.findByIdAndUpdate(invitee._id, {
    apartment: apartment._id,
  });
  await ApartmentModel.findByIdAndUpdate(invitation.apartment, {
    $push: {
      members: {
        userId: invitee._id,
        role: "NORMAL",
      },
    },
  });
  await InvitationModel.deleteOne({ _id: invitation._id });

  return {
    id: invitation._id,
    inviter: {
      id: invitation.inviter,
      username: inviter?.username ?? "Unknown Inviter",
    },
    invitee: {
      id: invitee._id,
      username: invitee.username,
    },
    apartment: {
      id: String(invitation.apartment),
      name: apartment.name,
      tasks: [],
      members: [],
    },
  };
}
