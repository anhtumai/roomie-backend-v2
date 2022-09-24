import fs from "fs";
import path from "path";

import { ApolloServer } from "apollo-server";

import { connectMongodb } from "@models/database";

import {
  getMyProfileResolver,
  updateMyProfileResolver,
} from "./resolvers/profile";
import {
  getApartmentFromProfileResolver,
  createApartmentResolver,
  updateApartmentResolver,
  assignAdminResolver,
  leaveApartmentResolver,
} from "./resolvers/apartment";
import {
  getMyInvitationsResolver,
  inviteResolver,
  rejectInvitationResolver,
  acceptInvitationResolver,
  cancelInvitationResolver,
} from "./resolvers/invitation";
import {
  createTaskResolver,
  updateTaskPropertiesResolver,
  updateTaskAssigneesResolver,
  deleteTaskResolver,
} from "./resolvers/task";
import { getUserFromMembershipResolver } from "./resolvers/membership";

connectMongodb();

const resolvers = {
  Query: {
    getMyProfile: getMyProfileResolver,
    getMyInvitations: getMyInvitationsResolver,
  },
  Mutation: {
    updateMyProfile: updateMyProfileResolver,
    createApartment: createApartmentResolver,
    updateApartment: updateApartmentResolver,
    assignAdmin: assignAdminResolver,
    leaveApartment: leaveApartmentResolver,

    invite: inviteResolver,
    rejectInvitation: rejectInvitationResolver,
    acceptInvitation: acceptInvitationResolver,
    cancelInvitation: cancelInvitationResolver,

    createTask: createTaskResolver,
    updateTaskProperties: updateTaskPropertiesResolver,
    updateTaskAssignees: updateTaskAssigneesResolver,
    deleteTask: deleteTaskResolver,
  },
  Profile: {
    apartment: getApartmentFromProfileResolver,
  },
  Membership: {
    user: getUserFromMembershipResolver,
  },
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf8"),
  resolvers,
  context: ({ req }) => {
    const bearerToken = req.headers.authorization || "";
    return { token: bearerToken.split(" ")[1] };
  },
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
