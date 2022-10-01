import { startOfWeek, endOfWeek, isAfter } from "date-fns";

import {
  validateFirebaseIdToken,
  findAndValidateUser,
  findAndValidateApartment,
  validateDateString,
  validateAdminRole,
} from "@validation";

import ApartmentModel from "@models/apartment";

function validateStartEnd({
  start,
  end,
}: {
  start: string;
  end?: string | null;
}) {
  validateDateString(start);
  if (typeof end === "string") {
    validateDateString(end);
  }
  if (typeof end === "string") {
    const startDate = startOfWeek(new Date(start));
    const endDate = endOfWeek(new Date(end));
    if (isAfter(startDate, endDate)) {
      throw new Error(`${start} cannot be after ${end}`);
    }
  }
}

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
  const jwtPayload = await validateFirebaseIdToken(context.token);

  validateStartEnd(args);

  const user = await findAndValidateUser(jwtPayload.sub);
  if (user.apartment === null || user.apartment === undefined) {
    throw new Error("You do not have an apartment");
  }
  const checkedApartment = await findAndValidateApartment(user.apartment);
  validateAdminRole(checkedApartment, user);
  validateAssigneesMembership(checkedApartment.members, args.assignees);

  const newTask = {
    name: args.name,
    description: args.description,
    frequency: args.frequency,
    start: startOfWeek(new Date(args.start)),
    end:
      typeof args.end === "string"
        ? endOfWeek(new Date(args.end as string))
        : null,
    assignees: args.assignees,
    createdBy: user._id,
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

export async function updateTaskPropertiesResolver(
  parent: any,
  args: {
    id: string;
    name: string;
    description: string;
    frequency: number;
    start: string;
    end?: string | null;
  },
  context: any,
  info: any,
) {
  const jwtPayload = await validateFirebaseIdToken(context.token);
  validateStartEnd(args);

  const user = await findAndValidateUser(jwtPayload.sub);
  if (user.apartment === null || user.apartment === undefined) {
    throw new Error("You do not have an apartment");
  }
  const checkedApartment = await findAndValidateApartment(user.apartment);
  validateAdminRole(checkedApartment, user);

  const updatedApartment = await ApartmentModel.findOneAndUpdate(
    {
      _id: user.apartment,
      "tasks._id": args.id,
    },
    {
      $set: {
        "tasks.$.name": args.name,
        "tasks.$.description": args.description,
        "tasks.$.frequency": args.frequency,
        "tasks.$.start": startOfWeek(new Date(args.start)).toISOString(),
        "tasks.$.end":
          typeof args.end === "string"
            ? endOfWeek(new Date(args.end)).toISOString()
            : null,
      },
    },
    { new: true },
  );
  if (updatedApartment === null) {
    throw new Error("Cannot update the task");
  }
  const updatedTask = updatedApartment.tasks.find(
    (task) => String(task._id) === args.id,
  );
  if (updatedTask === undefined) {
    throw new Error("Task not found to update");
  }
  updatedTask.id = args.id;
  return updatedTask;
}

export async function updateTaskAssigneesResolver(
  parent: any,
  args: {
    id: string;
    assignees: string[];
  },
  context: any,
  info: any,
) {
  const jwtPayload = await validateFirebaseIdToken(context.token);

  const user = await findAndValidateUser(jwtPayload.sub);
  if (user.apartment === null || user.apartment === undefined) {
    throw new Error("You do not have an apartment");
  }
  const checkedApartment = await findAndValidateApartment(user.apartment);
  validateAdminRole(checkedApartment, user);
  validateAssigneesMembership(checkedApartment.members, args.assignees);

  const updatedApartment = await ApartmentModel.findOneAndUpdate(
    {
      _id: user.apartment,
      "tasks._id": args.id,
    },
    {
      $set: {
        "tasks.$.assignees": args.assignees,
      },
    },
    { new: true },
  );
  if (updatedApartment === null) {
    throw new Error("Cannot update the task");
  }
  const updatedTask = updatedApartment.tasks.find(
    (task) => String(task._id) === args.id,
  );
  if (updatedTask === undefined) {
    throw new Error("Task not found to update");
  }
  updatedTask.id = args.id;
  return updatedTask;
}

export async function deleteTaskResolver(
  parent: any,
  args: {
    id: string;
  },
  context: any,
  info: any,
) {
  const jwtPayload = await validateFirebaseIdToken(context.token);

  const user = await findAndValidateUser(jwtPayload.sub);
  if (user.apartment === null || user.apartment === undefined) {
    throw new Error("You do not have an apartment");
  }
  const apartment = await findAndValidateApartment(user.apartment);
  validateAdminRole(apartment, user);

  await ApartmentModel.findOneAndUpdate(
    {
      _id: user.apartment,
    },
    {
      $pull: {
        tasks: {
          _id: args.id,
        },
      },
    },
  );
  const deletedTask = apartment.tasks.find(
    (task) => String(task._id) === args.id,
  );
  if (deletedTask === undefined) {
    throw new Error(`Task with id ${args.id} not found`);
  }
  deletedTask.id = args.id;
  return deletedTask;
}
