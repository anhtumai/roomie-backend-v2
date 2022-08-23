import http from "http";

import UserModel from "@roomie-backend-v2/models/user";
import { connectMongodb } from "@roomie-backend-v2/models/database";

type LoginData = {
  user: {
    created_at: string;
    email_verified: boolean;
    email: string;
    name: string;
    nickname: string;
    updated_at: string;
    user_id: string;
  };
};

connectMongodb();

const host = "localhost";
const port = 8000;

const server = http.createServer((req, res) => {
  if (req.method === "POST") {
    req.on("data", async (chunk: Buffer) => {
      const loginData: LoginData = JSON.parse(chunk.toString());
      console.log("Login Data", loginData);
      const { user_id, nickname } = loginData.user;

      try {
        await UserModel.findOneAndUpdate(
          { _id: user_id },
          {
            $setOnInsert: {
              _id: user_id,
              username: nickname,
            },
          },
          { upsert: true, new: true },
        );
      } catch (err) {
        console.error("Problem when accessing mongodb");
        console.error(err);
      }
    });
  }
  res.end();
});

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
