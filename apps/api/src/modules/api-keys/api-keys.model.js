import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
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
    name: { type: String, required: true, trim: true },
    keyPrefix: { type: String, required: true, trim: true },
    keyHash: { type: String, required: true, unique: true },
    permissions: [{ type: String }],
    rateLimit: { type: Number, default: 1000 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ApiKey = mongoose.model("ApiKey", apiKeySchema);
