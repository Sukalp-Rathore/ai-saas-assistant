import { UsageQuota, UsageLog } from "./usage.model.js";
import { ApiError } from "../../utils/api-error.js";

export async function getOrCreateQuota(organizationId) {
  const quota = await UsageQuota.findOne({ organizationId });
  if (quota) return quota;
  return UsageQuota.create({
    organizationId,
    apiRequests: 0,
    apiRequestsLimit: 1000,
    queryCount: 0,
    queryLimit: 100,
    reportCount: 0,
    reportLimit: 10,
  });
}

export async function checkAndIncrementQuota(organizationId, type = "api") {
  const quota = await getOrCreateQuota(organizationId);

  if (type === "api" && quota.apiRequests >= quota.apiRequestsLimit) {
    throw new ApiError(429, "API request quota exceeded");
  }
  if (type === "query" && quota.queryCount >= quota.queryLimit) {
    throw new ApiError(429, "Query quota exceeded");
  }
  if (type === "report" && quota.reportCount >= quota.reportLimit) {
    throw new ApiError(429, "Report quota exceeded");
  }

  if (type === "api") quota.apiRequests += 1;
  if (type === "query") quota.queryCount += 1;
  if (type === "report") quota.reportCount += 1;
  await quota.save();
  return quota;
}

export async function logUsage(payload) {
  return UsageLog.create(payload);
}
