import every from "lodash/every";
import cloneDeep from "lodash/cloneDeep";

import {
  validateToken,
  findAndValidateUser,
  findAndValidateApartment,
  validateAdminRole,
} from "graphqlApi/libs/validation";

import UserModel from "models/user";
import ApartmentModel, { MemberDocument, TaskDocument } from "models/apartment";

export async function getApartmentFromProfileResolver(
  parent: {
    id: string;
    email: string;
    username: string;
    role: string;
    apartmentId?: string;
  },
  args: any,
  context: any,
  info: any,
) {
  const { apartmentId } = parent;

  if (apartmentId === undefined || apartmentId === null) {
    return null;
  }
  const apartment = await ApartmentModel.findById(apartmentId);
  if (apartment === null) {
    return null;
  }

  return {
    id: apartment._id,
    name: apartment.name,
    tasks: apartment.tasks,
    members: apartment.members,
  };
}

export async function createApartmentResolver(
  parent: any,
  args: {
    name: string;
  },
  context: any,
  info: any,
) {
  const jwtPayload = await validateToken(context.token);
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
  return apartment;
}

export async function updateApartmentResolver(
  parent: any,
  args: {
    name: string;
  },
  context: any,
  info: any,
) {
  const jwtPayload = await validateToken(context.token);
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
  return apartment;
}

export async function assignAdminResolver(
  parent: any,
  args: {
    id: string;
  },
  context: any,
  info: any,
) {
  const jwtPayload = await validateToken(context.token);
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
  willBeAdminMember.role = "ADMIN";
  await apartment.save();
  return apartment;
}

function removeMemberFromMembers(
  members: MemberDocument[],
  toRemoveMemberId: string,
) {
  const updatedMembers = members.filter(
    (member) => member.userId !== toRemoveMemberId,
  );
  if (updatedMembers.length > 0 && every(updatedMembers, { role: "NORMAL" })) {
    updatedMembers[0].role = "ADMIN";
  }
  return updatedMembers;
}
function removeMemberFromTasks(
  tasks: TaskDocument[],
  toRemoveMemberId: string,
) {
  const updatedTasks = cloneDeep(tasks);
  for (const task of updatedTasks) {
    const assigneesWithoutToRemoveMember = task.assignees.filter(
      (assigneeId) => assigneeId !== toRemoveMemberId,
    );
    task.assignees = assigneesWithoutToRemoveMember;
  }
  return updatedTasks.filter((task) => task.assignees.length > 0);
}
export async function leaveApartmentResolver(
  parent: any,
  args: any,
  context: any,
  info: any,
) {
  const jwtPayload = await validateToken(context.token);
  const user = await findAndValidateUser(jwtPayload.sub);

  if (user.apartment === undefined || user.apartment === null) {
    throw new Error("You have no apartment to leave");
  }
  const apartment = await findAndValidateApartment(user.apartment);
  apartment.members = removeMemberFromMembers(apartment.members, user._id);
  apartment.tasks = removeMemberFromTasks(apartment.tasks, user._id);

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
  return updatedUser;
}
