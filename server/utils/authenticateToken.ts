import { IncomingMessage, ServerResponse } from "http";
import { config } from "dotenv";
import jwt from "jsonwebtoken";

config();

const { JWT_SECRET } = process.env;

export interface AuthenticatedRequest extends IncomingMessage {
  user?: {
    sub: string;
    claims: {
      UID: string;
      user_id: string;
    };
    iat: number;
    exp: number;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: ServerResponse, next: () => void) => {
  const token = req.headers["user-token"] as string | undefined;

  if (!token) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "토큰이 필요합니다." }));
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: Error | null, user: string | object | undefined) => {
    if (err) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "유효하지 않은 토큰입니다." }));
      return;
    }

    if (
      typeof user === "object" &&
      user.hasOwnProperty("sub") &&
      user.hasOwnProperty("claims") &&
      user.hasOwnProperty("iat") &&
      user.hasOwnProperty("exp")
    ) {
      req.user = user as AuthenticatedRequest["user"];
      next();
    } else {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "유효한 사용자 정보가 포함되지 않은 토큰입니다.",
        })
      );
    }
  });
};
