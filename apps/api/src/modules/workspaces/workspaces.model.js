import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    databaseType: {
      type: String,
      enum: ["mysql", "postgresql", "mongodb", "sqlite"],
      default: "mysql",
    },
    databaseConfig: { type: Object, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

workspaceSchema.index({ organizationId: 1, name: 1 });

export const Workspace = mongoose.model("Workspace", workspaceSchema);
