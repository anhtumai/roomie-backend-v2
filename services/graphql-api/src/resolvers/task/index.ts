import {
  validateToken,
  findAndValidateUser,
  isValidDateString,
} from "graphqlApi/libs/validation";

import { startOfWeek, endOfWeek } from "date-fns";

import UserModel from "models/user";
import ApartmentModel from "models/apartment";

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
  if (args.assignees.length === 0) {
    throw new Error("Task must have at least one assignee");
  }

  const user = await findAndValidateUser(jwtPayload.sub);
  if (user.apartment === null || user.role !== "ADMIN") {
    throw new Error("You must be ADMIN to create new task");
  }

  const assignees = await Promise.all(
    args.assignees.map(async (assigneeUsername) => {
      const assignee = await UserModel.findOne({ username: assigneeUsername });
      if (assignee === null) {
        throw new Error(`Cannot find user ${assigneeUsername}`);
      }
      if (assignee.apartment?.toString() !== user.apartment?.toString()) {
        throw new Error(
          `User ${assigneeUsername} does not belong to the same apartment`,
        );
      }
      return assignee;
    }),
  );

  const newTask = {
    name: args.name,
    description: args.description,
    frequency: args.frequency,
    start: startOfWeek(new Date(args.start)),
    end: isValidDateString(args.end)
      ? endOfWeek(new Date(args.end as string))
      : null,
    assignees: assignees.map((assignee) => assignee._id),
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
    assignees: assignees.map((assignee) => ({
      id: assignee._id,
      username: assignee.username,
    })),
  };
}
