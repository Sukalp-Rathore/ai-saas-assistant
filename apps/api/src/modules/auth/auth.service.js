import crypto from "crypto";
import { User } from "./auth.model.js";
import { Organization } from "../organizations/organizations.model.js";
import { createDefaultOrganization } from "../organizations/organizations.service.js";
import { ApiError } from "../../utils/api-error.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId
  };
}

export async function registerUser(payload) {
  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "Email already registered");
  }

  const user = await User.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    passwordHash: hashPassword(payload.password),
    role: "owner"
  });

  await createDefaultOrganization(user._id, `${payload.name} Organization`);

  const updatedUser = await User.findById(user._id);
  const tokenPayload = { sub: updatedUser._id.toString(), role: updatedUser.role };
  return {
    user: safeUser(updatedUser),
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload)
  };
}

export async function loginUser(payload) {
  const user = await User.findOne({ email: payload.email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.passwordHash !== hashPassword(payload.password)) {
    throw new ApiError(401, "Invalid credentials");
  }

  const tokenPayload = { sub: user._id.toString(), role: user.role };
  return {
    user: safeUser(user),
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload)
  };
}

export async function refreshSession(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.sub);

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const tokenPayload = { sub: user._id.toString(), role: user.role };
  return {
    user: safeUser(user),
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload)
  };
}

export async function updateUserProfile(userId, payload) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updates = {};
  if (payload.name?.trim()) {
    updates.name = payload.name.trim();
  }
  if (payload.password && payload.password.length >= 8) {
    updates.passwordHash = hashPassword(payload.password);
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields to update");
  }

  Object.assign(user, updates);
  await user.save();
  return safeUser(user);
}

export async function deleteUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.organizationId) {
    const organization = await Organization.findById(user.organizationId);
    if (organization && String(organization.ownerId) === String(userId)) {
      await Organization.findByIdAndDelete(organization._id);
    }
  }

  await User.findByIdAndDelete(userId);
  return { message: "Account deleted successfully" };
}
