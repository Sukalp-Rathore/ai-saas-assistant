import { logUsage } from "../usage/usage.service.js";
import { completeWithGroq } from "../../services/groq.service.js";
import { ApiError } from "../../utils/api-error.js";
import { Workspace } from "../workspaces/workspaces.model.js";
import { UsageQuota } from "../usage/usage.model.js";

export async function chat(req, res, next) {
  const start = Date.now();
  const question = req.body?.question || "";
  if (!question.trim()) {
    return next(new ApiError(400, "Question is required"));
  }

  try {
    const workspaceHint = req.workspaceId ? `Workspace ID: ${req.workspaceId}` : "Organization-wide request";
    const completion = await completeWithGroq({
      messages: [
        {
          role: "system",
          content:
            "You are a SaaS analytics assistant. Provide concise, business-focused answers based on the user prompt.",
        },
        {
          role: "user",
          content: `${workspaceHint}\n\nQuestion: ${question}`,
        },
      ],
      temperature: 0.2,
      maxTokens: 700,
    });

    const answer = completion.content;
    const responseTime = Date.now() - start;

    await logUsage({
      organizationId: req.organizationId,
      workspaceId: req.workspaceId,
      apiKeyId: req.apiKey?._id,
      endpoint: "/public/chat",
      queryText: question,
      tokensUsed: completion.usage.totalTokens,
      responseTimeMs: responseTime,
      success: true,
    });

    res.status(200).json({ success: true, data: { answer } });
  } catch (err) {
    await logUsage({
      organizationId: req.organizationId,
      workspaceId: req.workspaceId,
      apiKeyId: req.apiKey?._id,
      endpoint: "/public/chat",
      queryText: question,
      tokensUsed: 0,
      responseTimeMs: Date.now() - start,
      success: false,
    });
    next(err);
  }
}

export async function workspaceInfo(req, res, next) {
  try {
    const workspace = req.workspaceId
      ? await Workspace.findOne({ _id: req.workspaceId, organizationId: req.organizationId })
      : await Workspace.findOne({ organizationId: req.organizationId });

    if (!workspace) {
      return next(new ApiError(404, "Workspace not found"));
    }

    res.status(200).json({
      success: true,
      data: {
        id: workspace._id,
        name: workspace.name,
        databaseType: workspace.databaseType,
        description: workspace.description,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function usage(req, res, next) {
  try {
    const quota = await UsageQuota.findOne({ organizationId: req.organizationId });
    if (!quota) {
      return res.status(200).json({
        success: true,
        data: {
          apiRequests: 0,
          apiRequestsLimit: 1000,
          queryCount: 0,
          queryLimit: 100,
          reportCount: 0,
          reportLimit: 10,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        apiRequests: quota.apiRequests,
        apiRequestsLimit: quota.apiRequestsLimit,
        queryCount: quota.queryCount,
        queryLimit: quota.queryLimit,
        reportCount: quota.reportCount,
        reportLimit: quota.reportLimit,
      },
    });
  } catch (err) {
    next(err);
  }
}
