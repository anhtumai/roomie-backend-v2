import fs from "fs";
import path from "path";

import { ApolloServer } from "apollo-server";

import { connectMongodb } from "models/database";

import {
  getMyProfileResolver,
  updateMyProfileResolver,
  checkUsernameAvailableResolver,
} from "./resolvers/profile";
import {
  getApartmentFromProfileResolver,
  createApartmentResolver,
} from "./resolvers/apartment";
import {
  getMyInvitationsResolver,
  inviteResolver,
  rejectInvitationResolver,
  acceptInvitationResolver,
} from "./resolvers/invitation";
import {
  createTaskResolver,
  updateTaskPropertiesResolver,
  updateTaskAssigneesResolver,
} from "./resolvers/task";

connectMongodb();

const resolvers = {
  Query: {
    getMyProfile: getMyProfileResolver,
    getMyInvitations: getMyInvitationsResolver,
    checkUsernameAvailable: checkUsernameAvailableResolver,
  },
  Mutation: {
    updateMyProfile: updateMyProfileResolver,
    createApartment: createApartmentResolver,

    invite: inviteResolver,
    rejectInvitation: rejectInvitationResolver,
    acceptInvitation: acceptInvitationResolver,

    createTask: createTaskResolver,
    updateTaskProperties: updateTaskPropertiesResolver,
    updateTaskAssignees: updateTaskAssigneesResolver,
  },
  Profile: {
    apartment: getApartmentFromProfileResolver,
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
