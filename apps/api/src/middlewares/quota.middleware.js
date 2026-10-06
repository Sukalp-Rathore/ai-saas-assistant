import { checkAndIncrementQuota } from "../modules/usage/usage.service.js";

export async function checkQuota(req, res, next) {
  try {
    await checkAndIncrementQuota(req.organizationId, "api");
    next();
  } catch (err) {
    next(err);
  }
}
