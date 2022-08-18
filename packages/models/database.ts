import mongoose from "mongoose";

import config from "@roomie-backend-v2/config";

export function connectMongodb() {
  mongoose
    .connect(config.MONGODB_URI)
    .then(() => console.log("Connect to MongoDB successfully"))
    .catch((err) => console.error(err));
}
