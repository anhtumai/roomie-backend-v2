import http from "http";

import UserModel from "models/user";
import { connectMongodb } from "models/database";

type LoginData = {
  user: {
    created_at: string;
    email_verified: boolean;
    email: string;
    name: string;
    nickname: string;
    updated_at: string;
    user_id: string;
    identities: {
      connection: string;
      isSocial: string;
      provider: string;
      userId: string;
      user_id: string;
    }[];
  };
};

connectMongodb();

const host = "localhost";
const port = 8000;

function getUsernameSuffix(connection: string) {
  if (connection.includes("Username") && connection.includes("Password")) {
    return "1";
  }
  if (connection.includes("google")) {
    return "2";
  }
  if (connection.includes("windows")) {
    return "3";
  }
  return "4";
}

const server = http.createServer((req, res) => {
  if (req.method === "POST") {
    req.on("data", async (chunk: Buffer) => {
      const loginData: LoginData = JSON.parse(chunk.toString());
      console.log("Login Data");
      console.log(JSON.stringify(loginData, null, 4));
      const { user_id, email, identities } = loginData.user;

      const username = `${email}_${getUsernameSuffix(
        identities[0].connection,
      )}`;

      try {
        await UserModel.findOneAndUpdate(
          { _id: user_id },
          {
            $setOnInsert: {
              _id: user_id,
              username,
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
