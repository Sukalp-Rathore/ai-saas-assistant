import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true, trim: true },
    logo: { type: String, default: "" },
    plan: { type: String, default: "free" },
    settings: { type: Object, default: {} },
  },
  { timestamps: true }
);

export const Organization = mongoose.model("Organization", organizationSchema);
