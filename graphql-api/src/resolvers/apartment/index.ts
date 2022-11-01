import { Apartment, MembershipRole } from "@dto/apartment";

import every from "lodash/every";

import {
  validateFirebaseIdToken,
  findAndValidateUser,
  findAndValidateApartment,
  validateAdminRole,
} from "@validation";

import UserModel from "@models/user";
import ApartmentModel, {
  MemberDocument,
  TaskDocument,
  toApartmentOutput,
} from "@models/apartment";

export async function getApartmentFromProfileResolver(
  parent: {
    apartmentId?: string;
  },
  _args: any,
  _context: any,
  _info: any,
): Promise<Apartment | null> {
  const { apartmentId } = parent;

  if (apartmentId === undefined || apartmentId === null) {
    return null;
  }
  const apartment = await ApartmentModel.findById(apartmentId);
  if (apartment === null) {
    return null;
  }
  return toApartmentOutput(apartment);
}

export async function createApartmentResolver(
  _parent: any,
  args: {
    name: string;
  },
  context: any,
  _info: any,
): Promise<Apartment> {
  const jwtPayload = await validateFirebaseIdToken(context.token);
  const user = await findAndValidateUser(jwtPayload.sub);

  if (user.apartment !== undefined && user.apartment !== null) {
    throw new Error(`You already have an apartment`);
  }

  const apartment = await ApartmentModel.create({
    name: args.name,
    members: [
      {
        userId: user._id,
        role: "ADMIN",
      },
    ],
  });
  await UserModel.findOneAndUpdate(
    {
      _id: jwtPayload.sub,
    },
    { apartment: apartment._id },
  );
  return toApartmentOutput(apartment);
}

export async function updateApartmentResolver(
  _parent: any,
  args: {
    name: string;
  },
  context: any,
  _info: any,
): Promise<Apartment> {
  const jwtPayload = await validateFirebaseIdToken(context.token);
  const user = await findAndValidateUser(jwtPayload.sub);

  if (user.apartment === undefined || user.apartment === null) {
    throw new Error("You have no apartment to update");
  }
  const checkedApartment = await findAndValidateApartment(user.apartment);
  validateAdminRole(checkedApartment, user);

  const apartment = await ApartmentModel.findOneAndUpdate(
    { _id: user.apartment },
    {
      $set: {
        name: args.name,
      },
    },
    { new: true },
  );
  if (!apartment) {
    throw new Error("Unknown error when updating apartment");
  }
  return toApartmentOutput(apartment);
}

export async function assignAdminResolver(
  _parent: any,
  args: {
    id: string;
  },
  context: any,
  _info: any,
): Promise<Apartment> {
  const jwtPayload = await validateFirebaseIdToken(context.token);
  const user = await findAndValidateUser(jwtPayload.sub);

  if (user.apartment === undefined || user.apartment === null) {
    throw new Error("You have no apartment to update");
  }
  const apartment = await findAndValidateApartment(user.apartment);
  validateAdminRole(apartment, user);

  const willBeAdminMember = apartment.members.find(
    (member) => member.userId === args.id,
  );
  if (willBeAdminMember === undefined) {
    throw new Error(`User with id ${args.id} is not in your apartment`);
  }
  willBeAdminMember.role = MembershipRole.ADMIN;
  await apartment.save();
  return toApartmentOutput(apartment);
}

/*
 * Remove member with specific id from `apartment.member`
 * If that member is admin, assign first member in the list to be admin
 */
function removeMemberFromMembersById(
  members: MemberDocument[],
  toRemoveMemberId: string,
) {
  const updatedMembers = members.filter(
    (member) => member.userId !== toRemoveMemberId,
  );
  if (updatedMembers.length > 0 && every(updatedMembers, { role: "NORMAL" })) {
    updatedMembers[0].role = MembershipRole.ADMIN;
  }
  return updatedMembers;
}

/*
 * Remove assignee with specific id from all tasks in `apartment.tasks`
 * Tasks without any assignees will be removed as well
 */
function removeMemberFromTasksById(
  tasks: TaskDocument[],
  toRemoveMemberId: string,
) {
  const updatedTasks: TaskDocument[] = tasks.map((task) => task.toObject());
  for (const task of updatedTasks) {
    const assigneesWithoutToRemoveMember = task.assignees.filter(
      (assigneeId) => assigneeId !== toRemoveMemberId,
    );
    task.assignees = assigneesWithoutToRemoveMember;
  }
  return updatedTasks.filter((task) => task.assignees.length > 0);
}
export async function leaveApartmentResolver(
  _parent: any,
  _args: any,
  context: any,
  _info: any,
): Promise<boolean> {
  const jwtPayload = await validateFirebaseIdToken(context.token);
  const user = await findAndValidateUser(jwtPayload.sub);

  if (user.apartment === undefined || user.apartment === null) {
    throw new Error("You have no apartment to leave");
  }
  const apartment = await findAndValidateApartment(user.apartment);
  apartment.members = removeMemberFromMembersById(apartment.members, user._id);
  apartment.tasks = removeMemberFromTasksById(apartment.tasks, user._id);

  if (apartment.members.length > 0) {
    await apartment.save();
  } else {
    await ApartmentModel.deleteOne({ _id: user.apartment });
  }
  const updatedUser = await UserModel.findOneAndUpdate(
    { _id: user._id },
    {
      apartment: null,
    },
  );
  if (updatedUser === null) {
    throw new Error(`Fail to remove apartment from user with id ${user._id}`);
  }
  updatedUser.id = user._id;
  return true;
}
