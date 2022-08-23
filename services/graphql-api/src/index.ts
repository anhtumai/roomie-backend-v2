import fs from "fs";
import path from "path";

import { ApolloServer } from "apollo-server";

import { connectMongodb } from "@roomie-backend-v2/models/database";

import Query from "./resolvers/Query";
import Mutation from "./resolvers/Mutation";
import Profile from "./resolvers/Profile";

connectMongodb();

const resolvers = {
  Query,
  Mutation,
  Profile,
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
