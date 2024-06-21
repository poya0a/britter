import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "dotenv";

config();

const SECRET_KEY = process.env.TOKEN_SECRET_KEY || "default_secret_key";
const ACCESS_TOKEN_EXPIRES_IN_MINUTES = {
  DAY: 24 * 60,
  WEEK: 7 * 24 * 60 * 60,
};

export function createAccessToken(userVO: {
  UID: string;
  user_id: string;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const expiration = now + ACCESS_TOKEN_EXPIRES_IN_MINUTES.DAY * 60;

  const token = jwt.sign(
    {
      sub: `${userVO.user_id}`,
      claims: createClaims(userVO.UID, userVO.user_id),
      iat: now,
      exp: expiration,
    },
    SECRET_KEY,
    { algorithm: "HS512" }
  );

  return token;
}

export function createRefreshToken(userVO: {
  UID: string;
  user_id: string;
}): string {
  const randomKey = getRandomKey();
  const now = Math.floor(Date.now() / 1000);
  const expiration = now + ACCESS_TOKEN_EXPIRES_IN_MINUTES.WEEK;

  const token = jwt.sign(
    {
      sub: `${userVO.user_id}:${randomKey}`,
      claims: createClaims(userVO.UID, userVO.user_id),
      iat: now,
      exp: expiration,
    },
    SECRET_KEY,
    { algorithm: "HS512" }
  );

  return token;
}

function getRandomKey(): string {
  return crypto.randomBytes(16).toString("hex");
}

function createClaims(UID: string, user_id: string) {
  return {
    UID,
    user_id,
  };
}
