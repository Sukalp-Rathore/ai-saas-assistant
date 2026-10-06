import { Organization } from "../organizations/organizations.model.js";
import { User } from "../auth/auth.model.js";
import { UsageQuota } from "../usage/usage.model.js";
import { ApiError } from "../../utils/api-error.js";

const plans = {
  free: {
    name: "Free",
    price: 0,
    apiRequestsLimit: 1000,
    queryLimit: 100,
    reportLimit: 10,
    features: ["1 workspace", "1 API key", "Basic analytics", "Email support"],
  },
  starter: {
    name: "Starter",
    price: 29,
    apiRequestsLimit: 10000,
    queryLimit: 1000,
    reportLimit: 50,
    features: ["5 workspaces", "10 API keys", "Advanced analytics", "Priority email support"],
  },
  pro: {
    name: "Pro",
    price: 99,
    apiRequestsLimit: 100000,
    queryLimit: 10000,
    reportLimit: 250,
    features: ["Unlimited workspaces", "Unlimited API keys", "Real-time analytics", "Priority chat support"],
  },
  enterprise: {
    name: "Enterprise",
    price: null,
    apiRequestsLimit: 1000000,
    queryLimit: 100000,
    reportLimit: 1000,
    features: ["Custom limits", "Dedicated support", "SSO", "SLA"],
  },
};

export function listPlans() {
  return Object.entries(plans).map(([id, plan]) => ({ id, ...plan }));
}

async function resolveOrganization(userId) {
  const user = await User.findById(userId);
  if (!user?.organizationId) {
    throw new ApiError(404, "No organization found for this user");
  }
  return user.organizationId.toString();
}

export async function getSubscription(userId) {
  const organizationId = await resolveOrganization(userId);
  const [org, quota] = await Promise.all([
    Organization.findById(organizationId),
    UsageQuota.findOne({ organizationId }),
  ]);

  if (!org) {
    throw new ApiError(404, "Organization not found");
  }

  const plan = plans[org.plan] || plans.free;

  return {
    organizationId,
    currentPlan: {
      id: org.plan,
      ...plan,
    },
    usage: quota
      ? {
          apiRequests: quota.apiRequests,
          apiRequestsLimit: quota.apiRequestsLimit,
          queryCount: quota.queryCount,
          queryLimit: quota.queryLimit,
          reportCount: quota.reportCount,
          reportLimit: quota.reportLimit,
        }
      : {
          apiRequests: 0,
          apiRequestsLimit: plan.apiRequestsLimit,
          queryCount: 0,
          queryLimit: plan.queryLimit,
          reportCount: 0,
          reportLimit: plan.reportLimit,
        },
    plans: listPlans(),
  };
}

export async function upgradePlan(userId, planId) {
  if (!plans[planId]) {
    throw new ApiError(400, "Invalid plan");
  }

  const organizationId = await resolveOrganization(userId);
  const org = await Organization.findById(organizationId);
  if (!org) {
    throw new ApiError(404, "Organization not found");
  }

  const plan = plans[planId];

  org.plan = planId;
  await org.save();

  let quota = await UsageQuota.findOne({ organizationId });
  if (!quota) {
    quota = await UsageQuota.create({
      organizationId,
      apiRequests: 0,
      apiRequestsLimit: plan.apiRequestsLimit,
      queryCount: 0,
      queryLimit: plan.queryLimit,
      reportCount: 0,
      reportLimit: plan.reportLimit,
    });
  } else {
    quota.apiRequestsLimit = plan.apiRequestsLimit;
    quota.queryLimit = plan.queryLimit;
    quota.reportLimit = plan.reportLimit;
    await quota.save();
  }

  return {
    currentPlan: { id: planId, ...plan },
    usage: {
      apiRequests: quota.apiRequests,
      apiRequestsLimit: quota.apiRequestsLimit,
      queryCount: quota.queryCount,
      queryLimit: quota.queryLimit,
      reportCount: quota.reportCount,
      reportLimit: quota.reportLimit,
    },
  };
}
