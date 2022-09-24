import "dotenv/config";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

import config from "@config";

type JwtPayload = {
  nickname: string;
  name: string;
  picture: string;
  updated_at: string;
  email: string;
  email_verified: boolean;
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  nonce: string;
};

const client = jwksClient({
  jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

function getJwksClientKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (error, key) => {
    if (key === undefined || error !== null) {
      console.error(error);
      return;
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export async function validateToken(token: string): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getJwksClientKey,
      {
        audience: config.API_IDENTIFIER,
        issuer: `https://${config.AUTH0_DOMAIN}/`,
        algorithms: ["RS256"],
      },
      (error, decoded) => {
        if (error) {
          reject(error);
        }
        if (typeof decoded === "object") {
          resolve(decoded as JwtPayload);
        }
        reject(`Invalid Jwt Payload ${decoded}`);
      },
    );
  });
}
