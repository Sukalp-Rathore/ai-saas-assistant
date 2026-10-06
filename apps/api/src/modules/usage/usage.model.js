import mongoose from "mongoose";

const usageQuotaSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true,
      index: true,
    },
    apiRequests: { type: Number, default: 0 },
    apiRequestsLimit: { type: Number, default: 1000 },
    queryCount: { type: Number, default: 0 },
    queryLimit: { type: Number, default: 100 },
    reportCount: { type: Number, default: 0 },
    reportLimit: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export const UsageQuota = mongoose.model("UsageQuota", usageQuotaSchema);

const usageLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
      index: true,
    },
    apiKeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiKey",
      default: null,
      index: true,
    },
    endpoint: { type: String, required: true },
    queryText: { type: String, default: "" },
    tokensUsed: { type: Number, default: 0 },
    responseTimeMs: { type: Number, default: 0 },
    success: { type: Boolean, default: true },
  },
  { timestamps: true }
);

usageLogSchema.index({ organizationId: 1, createdAt: -1 });

export const UsageLog = mongoose.model("UsageLog", usageLogSchema);
