import http from "http";

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

const host = "localhost";
const port = 8000;

const server = http.createServer((req, res) => {
  if (req.method === "POST") {
    req.on("data", (chunk: Buffer) => {
      const loginData: LoginData = JSON.parse(chunk.toString());
      const { user_id, nickname } = loginData.user;
      console.log("User", user_id);
      console.log("Nickname", nickname);
    });
  }
  res.end();
});

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
