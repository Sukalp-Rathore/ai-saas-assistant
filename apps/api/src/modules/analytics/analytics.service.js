import mongoose from "mongoose";
import { UsageLog, UsageQuota } from "../usage/usage.model.js";
import { User } from "../auth/auth.model.js";
import { Workspace } from "../workspaces/workspaces.model.js";
import { ApiError } from "../../utils/api-error.js";

async function resolveOrganization(userId) {
  const user = await User.findById(userId);
  if (!user?.organizationId) {
    throw new ApiError(404, "No organization found for this user");
  }
  return user.organizationId.toString();
}

function startOfToday() {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now;
}

function startOfWeek() {
  const now = new Date();
  const day = now.getUTCDay() || 7;
  now.setUTCDate(now.getUTCDate() - day + 1);
  now.setUTCHours(0, 0, 0, 0);
  return now;
}

function startOfMonth() {
  const now = new Date();
  now.setUTCDate(1);
  now.setUTCHours(0, 0, 0, 0);
  return now;
}

export async function getAnalytics(userId) {
  const organizationId = await resolveOrganization(userId);

  const [
    quota,
    totalRequests,
    todayRequests,
    weekRequests,
    monthRequests,
    recentActivity,
    topWorkspaces,
    topEndpoints,
    topApiKeys,
  ] = await Promise.all([
    UsageQuota.findOne({ organizationId }),
    UsageLog.countDocuments({ organizationId }),
    UsageLog.countDocuments({ organizationId, createdAt: { $gte: startOfToday() } }),
    UsageLog.countDocuments({ organizationId, createdAt: { $gte: startOfWeek() } }),
    UsageLog.countDocuments({ organizationId, createdAt: { $gte: startOfMonth() } }),
    UsageLog.find({ organizationId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("endpoint queryText success createdAt workspaceId apiKeyId"),
    getTopWorkspaces(organizationId),
    getTopEndpoints(organizationId),
    getTopApiKeys(organizationId),
  ]);

  const workspaces = await Workspace.find({ organizationId }).select("_id name");
  const workspaceMap = new Map(workspaces.map((ws) => [ws._id.toString(), ws.name]));

  const dailyRequests = await getDailyRequests(organizationId);

  return {
    quota: quota || {
      apiRequests: 0,
      apiRequestsLimit: 1000,
      queryCount: 0,
      queryLimit: 100,
      reportCount: 0,
      reportLimit: 10,
    },
    stats: {
      totalRequests,
      todayRequests,
      weekRequests,
      monthRequests,
      activeUsers: await User.countDocuments({ organizationId }),
      totalWorkspaces: await Workspace.countDocuments({ organizationId }),
    },
    recentActivity: recentActivity.map((item) => ({
      ...item.toObject(),
      workspaceName: item.workspaceId ? workspaceMap.get(item.workspaceId.toString()) : null,
    })),
    topWorkspaces,
    topEndpoints,
    topApiKeys,
    dailyRequests,
  };
}

async function getTopWorkspaces(organizationId) {
  const results = await UsageLog.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
    { $group: { _id: "$workspaceId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const workspaceIds = results.filter((r) => r._id).map((r) => r._id);
  const workspaces = await Workspace.find({ _id: { $in: workspaceIds } }).select("_id name");
  const map = new Map(workspaces.map((ws) => [ws._id.toString(), ws.name]));

  return results.map((r) => ({
    workspaceId: r._id,
    workspaceName: r._id ? map.get(r._id.toString()) || "Unknown" : "Organization-wide",
    count: r.count,
  }));
}

async function getTopEndpoints(organizationId) {
  return UsageLog.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
    { $group: { _id: "$endpoint", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);
}

async function getTopApiKeys(organizationId) {
  return UsageLog.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(organizationId), apiKeyId: { $ne: null } } },
    { $group: { _id: "$apiKeyId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);
}

async function getDailyRequests(organizationId) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    d.setUTCHours(0, 0, 0, 0);
    days.push(d);
  }

  const results = await Promise.all(
    days.map(async (date) => {
      const nextDay = new Date(date);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      const count = await UsageLog.countDocuments({
        organizationId,
        createdAt: { $gte: date, $lt: nextDay },
      });
      return {
        date: date.toISOString().split("T")[0],
        count,
      };
    })
  );

  return results;
}
