import crypto from "crypto";
import { ApiKey } from "../modules/api-keys/api-keys.model.js";
import { ApiError } from "../utils/api-error.js";

export async function authenticateApiKey(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers["x-api-key"];

  let token = null;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (typeof apiKeyHeader === "string") {
    token = apiKeyHeader;
  }

  if (!token) {
    return next(new ApiError(401, "API key missing"));
  }

  const keyHash = crypto.createHash("sha256").update(token).digest("hex");
  const apiKey = await ApiKey.findOne({ keyHash });

  if (!apiKey || !apiKey.isActive) {
    return next(new ApiError(401, "Invalid or revoked API key"));
  }

  req.apiKey = apiKey;
  req.organizationId = apiKey.organizationId.toString();
  req.workspaceId = apiKey.workspaceId ? apiKey.workspaceId.toString() : null;
  next();
}
