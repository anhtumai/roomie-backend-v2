import * as functions from "firebase-functions";

import { connectMongodb, UserModel } from "./mongodbHelper";

connectMongodb();

export const createNewUser = functions
  .region("europe-west1")
  .auth.user()
  .onCreate(async (user) => {
    const { uid, email } = user;
    const newUsername = email ? email.split("@")[0] : "new-user";
    try {
      await UserModel.create({
        _id: uid,
        username: newUsername,
      });
    } catch (err) {
      console.error("Error when writing new data to database", err);
    }
  });
