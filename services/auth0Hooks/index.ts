import mongoose from "mongoose";

import config from "@roomie-backend-v2/config";

mongoose
  .connect(config.MONGODB_URI)
  .then((result) => {
    console.log("Connect to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

exports.onExecutePostUserRegistration = async (event) => {
  //
};
