import { IncomingMessage, ServerResponse } from "http";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.TOKEN_SECRET_KEY || "default_secret_key";

interface AuthenticatedRequest extends IncomingMessage {
  user?: string | object;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: ServerResponse,
  next: () => void
) => {
  const authHeader = req.headers["User-Token"] as string | undefined;

  let token: string | undefined;

  if (authHeader) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "토큰이 필요합니다." }));
    return;
  }

  jwt.verify(
    token,
    JWT_SECRET,
    (err: Error | null, user: string | object | undefined) => {
      if (err) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "유효하지 않은 토큰입니다." }));
        return;
      }

      req.user = user;
      next();
    }
  );
};
