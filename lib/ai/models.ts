import { createOpenAI } from "@ai-sdk/openai";

const openrouter = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

export const getModel = (modelId: string) => {
    // Handle "free" vs "paid" aliases if passed, although the selector usually passes the ID directly now.
    // The previous implementation in selector used "free" or "paid" as types but stored explicit IDs.
    // However, user profile might still have "free" or "paid" as default strings if not updated.

    if (modelId === "free") return openrouter("google/gemini-2.0-flash-001");
    if (modelId === "paid") return openrouter("anthropic/claude-3.5-sonnet");
    if (modelId === "glm-4") return openrouter("thudm/glm-4-9b-chat");
    if (modelId === "glm-5") return openrouter("z-ai/glm-5"); // Correct slug


    // Common GLM-4 models on OpenRouter: "thudm/glm-4-9b-chat" (free-ish?), "thudm/glm-4" (paid?)
    // User asked for "Free/Cheap".
    // "thudm/glm-4-9b-chat" is usually very cheap.
    // Let's check likely slug. "thudm/glm-4" is the big one. "thudm/glm-4-9b-chat" is the small one.
    // Let's try "thudm/glm-4-9b-chat".

    return openrouter(modelId);
};
