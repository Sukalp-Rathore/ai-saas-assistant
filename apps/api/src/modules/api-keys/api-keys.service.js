import crypto from "crypto";
import { ApiKey } from "./api-keys.model.js";
import { User } from "../auth/auth.model.js";
import { Workspace } from "../workspaces/workspaces.model.js";
import { ApiError } from "../../utils/api-error.js";

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function generateKey() {
  const token = crypto.randomBytes(32).toString("hex");
  return `sk_${token}`;
}

async function resolveOrganization(userId) {
  const user = await User.findById(userId);
  if (!user?.organizationId) {
    throw new ApiError(404, "No organization found for this user");
  }
  return user.organizationId.toString();
}

export async function listApiKeys(userId) {
  const organizationId = await resolveOrganization(userId);
  return ApiKey.find({ organizationId }).select("-keyHash").sort({ createdAt: -1 });
}

export async function createApiKey(userId, payload) {
  const organizationId = await resolveOrganization(userId);

  if (payload.workspaceId) {
    const workspace = await Workspace.findOne({ _id: payload.workspaceId, organizationId });
    if (!workspace) {
      throw new ApiError(404, "Workspace not found");
    }
  }

  const key = generateKey();
  const keyHash = sha256(key);
  const keyPrefix = key.slice(0, 10);

  const apiKey = await ApiKey.create({
    organizationId,
    workspaceId: payload.workspaceId || null,
    name: payload.name,
    keyPrefix,
    keyHash,
    permissions: payload.permissions || ["read"],
    rateLimit: payload.rateLimit ?? 1000,
    isActive: payload.isActive ?? true,
  });

  return { apiKey, key };
}

export async function updateApiKey(userId, id, payload) {
  const organizationId = await resolveOrganization(userId);
  const updates = {};
  if (payload.name !== undefined) updates.name = payload.name;
  if (payload.isActive !== undefined) updates.isActive = payload.isActive;
  if (payload.permissions !== undefined) updates.permissions = payload.permissions;
  if (payload.rateLimit !== undefined) updates.rateLimit = payload.rateLimit;

  const apiKey = await ApiKey.findOneAndUpdate(
    { _id: id, organizationId },
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-keyHash");

  if (!apiKey) {
    throw new ApiError(404, "API key not found");
  }
  return apiKey;
}

export async function deleteApiKey(userId, id) {
  const organizationId = await resolveOrganization(userId);
  const apiKey = await ApiKey.findOneAndDelete({ _id: id, organizationId });
  if (!apiKey) {
    throw new ApiError(404, "API key not found");
  }
  return { message: "API key deleted" };
}

export async function regenerateApiKey(userId, id) {
  const organizationId = await resolveOrganization(userId);
  const key = generateKey();
  const keyHash = sha256(key);
  const keyPrefix = key.slice(0, 10);

  const apiKey = await ApiKey.findOneAndUpdate(
    { _id: id, organizationId },
    { $set: { keyHash, keyPrefix } },
    { new: true, runValidators: true }
  ).select("-keyHash");

  if (!apiKey) {
    throw new ApiError(404, "API key not found");
  }
  return { apiKey, key };
}
