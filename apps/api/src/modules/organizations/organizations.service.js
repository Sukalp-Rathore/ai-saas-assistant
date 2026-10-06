import { Organization } from "./organizations.model.js";
import { User } from "../auth/auth.model.js";
import { ApiError } from "../../utils/api-error.js";

function makeSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 60);
}

async function makeUniqueSlug(name, excludeOrganizationId = null) {
  const base = makeSlug(name) || "organization";
  let candidate = base;
  let counter = 2;

  while (true) {
    const existing = await Organization.findOne({ slug: candidate }).select("_id");
    if (!existing || (excludeOrganizationId && existing._id.toString() === excludeOrganizationId.toString())) {
      return candidate;
    }

    const suffix = `-${counter}`;
    candidate = `${base.slice(0, Math.max(1, 60 - suffix.length))}${suffix}`;
    counter += 1;
  }
}

export async function getMyOrganization(userId) {
  const user = await User.findById(userId);
  if (!user?.organizationId) {
    return null;
  }
  return Organization.findById(user.organizationId);
}

export async function createDefaultOrganization(userId, name) {
  const user = await User.findById(userId);
  if (user.organizationId) {
    throw new ApiError(409, "Organization already exists for this user");
  }

  const org = await Organization.create({
    ownerId: userId,
    name,
    slug: await makeUniqueSlug(name),
  });

  user.organizationId = org._id;
  await user.save();
  return org;
}

export async function updateMyOrganization(userId, payload) {
  const user = await User.findById(userId);
  if (!user?.organizationId) {
    throw new ApiError(404, "Organization not found");
  }

  const updates = {};
  if (payload.name) {
    updates.name = payload.name.trim();
    updates.slug = await makeUniqueSlug(payload.name, user.organizationId);
  }

  const org = await Organization.findByIdAndUpdate(
    user.organizationId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return org;
}

export async function updateMyOrganizationLogo(userId, base64Logo) {
  const user = await User.findById(userId);
  if (!user?.organizationId) {
    throw new ApiError(404, "Organization not found");
  }

  if (typeof base64Logo !== "string" || !base64Logo.startsWith("data:image/")) {
    throw new ApiError(400, "Invalid image data URI");
  }

  const org = await Organization.findByIdAndUpdate(
    user.organizationId,
    { $set: { logo: base64Logo } },
    { new: true, runValidators: true }
  );

  return org;
}

export async function deleteMyOrganizationLogo(userId) {
  const user = await User.findById(userId);
  if (!user?.organizationId) {
    throw new ApiError(404, "Organization not found");
  }

  const org = await Organization.findByIdAndUpdate(
    user.organizationId,
    { $set: { logo: "" } },
    { new: true, runValidators: true }
  );

  return org;
}
