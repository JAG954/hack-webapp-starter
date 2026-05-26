import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const SUBCONSCIOUS_MODEL_ID = "subconscious/tim-qwen3.6-27b";

const subconsciousProvider = createOpenAICompatible({
  name: "subconscious",
  baseURL: "https://api.subconscious.dev/v1",
  apiKey: process.env.SUBCONSCIOUS_API_KEY,
  includeUsage: true,
});

function withThinking(enableThinking: boolean) {
  return subconsciousProvider.languageModel(SUBCONSCIOUS_MODEL_ID, {
    transformRequestBody: (body) => ({
      ...body,
      chat_template_kwargs: { enable_thinking: enableThinking },
      ...(body.stream ? { stream_options: { include_usage: true } } : {}),
    }),
  });
}

/** Fast chat — thinking off for lower latency and cleaner replies. */
export const chatModel = withThinking(false);

/** Long-running agents — thinking on for multi-step reasoning. */
export const agentModel = withThinking(true);

export function requireSubconsciousApiKey() {
  const apiKey = process.env.SUBCONSCIOUS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing SUBCONSCIOUS_API_KEY. Get one at https://www.subconscious.dev/platform",
    );
  }
  return apiKey;
}
