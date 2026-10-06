import * as teamService from "./teams.service.js";

export async function list(req, res, next) {
  try {
    const members = await teamService.listMembers(req.user.id);
    res.status(200).json({ success: true, data: members });
  } catch (err) {
    next(err);
  }
}

export async function updateRole(req, res, next) {
  try {
    const member = await teamService.updateRole(req.user.id, req.params.id, req.body.role);
    res.status(200).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
}

export async function invite(req, res, next) {
  try {
    const invitation = await teamService.inviteMember(req.user.id, req.body);
    res.status(201).json({ success: true, data: invitation });
  } catch (err) {
    next(err);
  }
}

export async function listInvites(req, res, next) {
  try {
    const invitations = await teamService.listInvitations(req.user.id);
    res.status(200).json({ success: true, data: invitations });
  } catch (err) {
    next(err);
  }
}

export async function revokeInvite(req, res, next) {
  try {
    const invitation = await teamService.revokeInvitation(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: invitation });
  } catch (err) {
    next(err);
  }
}

export async function acceptInvite(req, res, next) {
  try {
    const result = await teamService.acceptInvitation(req.user.id, req.body.token);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req, res, next) {
  try {
    const member = await teamService.removeMember(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
}
