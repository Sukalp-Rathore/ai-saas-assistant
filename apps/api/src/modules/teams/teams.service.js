import { User } from "../auth/auth.model.js";
import { Organization } from "../organizations/organizations.model.js";
import { ApiError } from "../../utils/api-error.js";
import crypto from "crypto";
import { TeamInvitation } from "./team-invitation.model.js";
import { sendInviteEmail } from "../../services/email.service.js";

async function resolveRequester(requesterId) {
  const requester = await User.findById(requesterId);
  if (!requester?.organizationId) {
    throw new ApiError(404, "No organization found for this user");
  }
  return requester;
}

export async function listMembers(requesterId) {
  const requester = await resolveRequester(requesterId);
  return User.find({ organizationId: requester.organizationId })
    .select("-passwordHash")
    .sort({ createdAt: -1 });
}

export async function updateRole(requesterId, memberId, role) {
  const requester = await resolveRequester(requesterId);
  if (!["owner", "admin"].includes(requester.role)) {
    throw new ApiError(403, "Only owners and admins can manage roles");
  }
  if (!["member", "admin"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const member = await User.findOne({
    _id: memberId,
    organizationId: requester.organizationId,
  });
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  if (member._id.toString() === requester._id.toString()) {
    throw new ApiError(403, "You cannot change your own role");
  }
  if (member.role === "owner") {
    throw new ApiError(403, "Cannot change the owner's role");
  }
  if (requester.role === "admin" && member.role === "admin") {
    throw new ApiError(403, "Admins cannot modify other admins");
  }

  member.role = role;
  await member.save();
  return member;
}

export async function inviteMember(requesterId, payload) {
  const requester = await resolveRequester(requesterId);
  if (!["owner", "admin"].includes(requester.role)) {
    throw new ApiError(403, "Only owners and admins can invite members");
  }

  const email = String(payload.email || "").trim().toLowerCase();
  if (!email.includes("@")) {
    throw new ApiError(400, "Valid email is required");
  }

  const role = payload.role === "admin" ? "admin" : "member";

  const existingMember = await User.findOne({
    email,
    organizationId: requester.organizationId,
  });
  if (existingMember) {
    throw new ApiError(409, "User is already a member of your organization");
  }

  const pendingExisting = await TeamInvitation.findOne({
    organizationId: requester.organizationId,
    email,
    status: "pending",
    expiresAt: { $gt: new Date() },
  });
  if (pendingExisting) {
    throw new ApiError(409, "An active invitation already exists for this email");
  }

  const token = crypto.randomBytes(24).toString("hex");
  const invitation = await TeamInvitation.create({
    organizationId: requester.organizationId,
    email,
    role,
    token,
    invitedBy: requester._id,
    status: "pending",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const organization = await Organization.findById(requester.organizationId).select("name");
  sendInviteEmail({
    to: email,
    orgName: organization?.name || "Sukalp SaaS",
    inviterName: requester.name,
    token,
    role,
  }).catch((err) => {
    console.error("Failed to send invite email:", err.message);
  });

  return invitation;
}

export async function listInvitations(requesterId) {
  const requester = await resolveRequester(requesterId);
  return TeamInvitation.find({
    organizationId: requester.organizationId,
    status: { $in: ["pending", "revoked", "accepted"] },
  }).sort({ createdAt: -1 });
}

export async function revokeInvitation(requesterId, invitationId) {
  const requester = await resolveRequester(requesterId);
  if (!["owner", "admin"].includes(requester.role)) {
    throw new ApiError(403, "Only owners and admins can revoke invitations");
  }

  const invitation = await TeamInvitation.findOne({
    _id: invitationId,
    organizationId: requester.organizationId,
  });
  if (!invitation) {
    throw new ApiError(404, "Invitation not found");
  }
  if (invitation.status !== "pending") {
    throw new ApiError(400, "Only pending invitations can be revoked");
  }

  invitation.status = "revoked";
  await invitation.save();
  return invitation;
}

export async function acceptInvitation(requesterId, token) {
  const user = await User.findById(requesterId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const invitation = await TeamInvitation.findOne({ token, status: "pending" });
  if (!invitation) {
    throw new ApiError(404, "Invitation not found or no longer active");
  }
  if (invitation.expiresAt.getTime() < Date.now()) {
    invitation.status = "expired";
    await invitation.save();
    throw new ApiError(400, "Invitation has expired");
  }
  if (invitation.email !== user.email.toLowerCase()) {
    throw new ApiError(403, "Invitation email does not match your account");
  }
  if (user.organizationId && user.organizationId.toString() === invitation.organizationId.toString()) {
    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    await invitation.save();
    return { message: "You are already part of this organization" };
  }
  if (user.organizationId) {
    throw new ApiError(403, "You are already in another organization");
  }

  user.organizationId = invitation.organizationId;
  user.role = invitation.role;
  await user.save();

  invitation.status = "accepted";
  invitation.acceptedAt = new Date();
  await invitation.save();

  return { message: "Invitation accepted" };
}

export async function removeMember(requesterId, memberId) {
  const requester = await resolveRequester(requesterId);
  if (!["owner", "admin"].includes(requester.role)) {
    throw new ApiError(403, "Only owners and admins can remove members");
  }

  const member = await User.findOne({ _id: memberId, organizationId: requester.organizationId });
  if (!member) {
    throw new ApiError(404, "Member not found");
  }
  if (member._id.toString() === requester._id.toString()) {
    throw new ApiError(403, "You cannot remove yourself");
  }
  if (member.role === "owner") {
    throw new ApiError(403, "Cannot remove the organization owner");
  }
  if (requester.role === "admin" && member.role === "admin") {
    throw new ApiError(403, "Admins cannot remove other admins");
  }

  member.organizationId = null;
  member.role = "member";
  await member.save();
  return member;
}
