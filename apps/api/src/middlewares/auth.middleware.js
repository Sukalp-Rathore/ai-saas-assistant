import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Access token missing"));
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret);
    req.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired access token"));
  }
}
