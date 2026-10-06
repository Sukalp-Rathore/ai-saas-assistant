import * as organizationService from "./organizations.service.js";
import { ApiError } from "../../utils/api-error.js";

export async function getMyOrganization(req, res, next) {
  try {
    const org = await organizationService.getMyOrganization(req.user.id);
    if (!org) {
      throw new ApiError(404, "Organization not found");
    }
    res.status(200).json({ success: true, data: org });
  } catch (err) {
    next(err);
  }
}

export async function updateMyOrganization(req, res, next) {
  try {
    const org = await organizationService.updateMyOrganization(req.user.id, req.body);
    res.status(200).json({ success: true, data: org });
  } catch (err) {
    next(err);
  }
}

export async function updateMyOrganizationLogo(req, res, next) {
  try {
    const org = await organizationService.updateMyOrganizationLogo(req.user.id, req.body.logo);
    res.status(200).json({ success: true, data: org });
  } catch (err) {
    next(err);
  }
}

export async function deleteMyOrganizationLogo(req, res, next) {
  try {
    const org = await organizationService.deleteMyOrganizationLogo(req.user.id);
    res.status(200).json({ success: true, data: org });
  } catch (err) {
    next(err);
  }
}
