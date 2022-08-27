import {
  validateToken,
  findAndValidateUser,
  isValidDateString,
  validateAdminRole,
} from "graphqlApi/libs/validation";

import { startOfWeek, endOfWeek } from "date-fns";

import ApartmentModel from "models/apartment";

function validateAssigneesMembership(
  apartmentMembers: {
    userId: string;
  }[],
  assignees: string[],
) {
  if (assignees.length === 0) {
    throw new Error("Task must have at least one assignee");
  }

  const outsiderIds: string[] = [];
  for (const assigneeId of assignees) {
    const membership = apartmentMembers.find(
      (member) => member.userId === assigneeId,
    );
    if (membership === undefined) {
      outsiderIds.push(assigneeId);
    }
  }
  if (outsiderIds.length > 0) {
    throw new Error(
      `Users with ids ${outsiderIds.join(
        ", ",
      )} does not belong to the apartment`,
    );
  }
}

export async function createTaskResolver(
  parent: any,
  args: {
    name: string;
    description: string;
    frequency: number;
    start: string;
    end?: string | null;
    assignees: string[];
  },
  context: any,
  info: any,
) {
  const jwtPayload = await validateToken(context.token);

  if (!isValidDateString(args.start)) {
    throw new Error(
      `Start: ${args.start} is invalid. It should be ISO string format.`,
    );
  }

  const user = await findAndValidateUser(jwtPayload.sub);
  if (user.apartment === null) {
    throw new Error("You must be ADMIN to create new task");
  }
  const checkedApartment = await ApartmentModel.findById(user.apartment);
  if (checkedApartment === null || checkedApartment === undefined) {
    throw new Error("Cannot find apartment");
  }
  validateAdminRole(checkedApartment, user);
  validateAssigneesMembership(checkedApartment.members, args.assignees);

  const newTask = {
    name: args.name,
    description: args.description,
    frequency: args.frequency,
    start: startOfWeek(new Date(args.start)),
    end: isValidDateString(args.end)
      ? endOfWeek(new Date(args.end as string))
      : null,
    assignees: args.assignees,
  };
  const apartment = await ApartmentModel.findOneAndUpdate(
    { _id: user.apartment },
    {
      $push: { tasks: newTask },
    },
    { new: true },
  );
  return {
    id:
      apartment !== null
        ? apartment.tasks[apartment.tasks.length - 1]._id.toString()
        : "Unknown Task Id",
    name: newTask.name,
    description: newTask.description,
    frequency: newTask.frequency,
    start: newTask.start.toISOString(),
    end: newTask.end?.toISOString(),
    assignees: args.assignees,
  };
}
