import * as workspaceService from "./workspaces.service.js";

export async function list(req, res, next) {
  try {
    const workspaces = await workspaceService.listWorkspaces(req.user.id);
    res.status(200).json({ success: true, data: workspaces });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const workspace = await workspaceService.createWorkspace(req.user.id, req.body);
    res.status(201).json({ success: true, data: workspace });
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const workspace = await workspaceService.getWorkspace(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: workspace });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const workspace = await workspaceService.updateWorkspace(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, data: workspace });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await workspaceService.deleteWorkspace(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: "Workspace deleted" });
  } catch (err) {
    next(err);
  }
}

export async function testConnection(req, res, next) {
  try {
    const result = await workspaceService.testConnection(req.user.id, req.body);
    res.status(200).json({ success: result.success, message: result.message, collections: result.collections || [], data: result });
  } catch (err) {
    next(err);
  }
}
