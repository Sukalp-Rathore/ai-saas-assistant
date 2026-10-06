import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

function ensureGroqConfig() {
  if (!env.groqApiKey) {
    throw new ApiError(500, "Missing GROQ_API_KEY configuration");
  }
}

export async function completeWithGroq({ messages, temperature = 0.2, maxTokens = 800 }) {
  ensureGroqConfig();

  const response = await fetch(`${env.groqBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.groqApiKey}`,
    },
    body: JSON.stringify({
      model: env.groqModel,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(response.status, data?.error?.message || "Groq request failed");
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new ApiError(502, "Invalid response from Groq");
  }

  return {
    content,
    usage: {
      promptTokens: data?.usage?.prompt_tokens || 0,
      completionTokens: data?.usage?.completion_tokens || 0,
      totalTokens: data?.usage?.total_tokens || 0,
    },
  };
}
