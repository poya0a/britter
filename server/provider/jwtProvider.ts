// import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "dotenv";
var jwt = require("jsonwebtoken");

config();

const SECRET_KEY = process.env.SUPABASE_JWT_SECRET || "default_secret_key";
const ACCESS_TOKEN_EXPIRES_IN_MINUTES = {
  DAY: 24 * 60,
  WEEK: 7 * 24 * 60 * 60,
};

export function createAccessToken(userVO: { UID: string; user_id: string }): string {
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

export function createRefreshToken(userVO: { UID: string; user_id: string }): string {
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

interface DecodedToken {
  sub: string;
  claims?: { UID: string; user_id: string };
}

export function verifyRefreshToken(refreshToken: string): { UID: string; user_id: string } | null {
  try {
    const decoded = jwt.verify(refreshToken, SECRET_KEY, {
      algorithms: ["HS512"],
    }) as DecodedToken;

    const [user_id, randomKey] = decoded.sub.split(":");
    const UID = decoded.claims?.UID || "";

    return { UID, user_id };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Refresh token expired");
    } else {
      console.error("Error verifying refresh token:", error);
    }
    return null;
  }
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
