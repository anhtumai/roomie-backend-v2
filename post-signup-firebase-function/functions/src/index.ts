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
      await UserModel.findOneAndUpdate(
        {
          _id: uid,
        },
        {
          $setOnInsert: {
            _id: uid,
            username: newUsername,
          },
        },
        { upsert: true, new: true },
      );
    } catch (err) {
      console.error("Error when writing new data to database", err);
    }
  });
