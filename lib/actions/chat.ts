"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, dailyMetrics, meals, kitchenItems, exercises } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { addKitchenItem } from "@/lib/actions/kitchen";

// Define Tools
const tools = [
    {
        type: "function",
        function: {
            name: "add_shopping_items",
            description: "Add multiple items to the user's shopping list or pantry.",
            parameters: {
                type: "object",
                properties: {
                    items: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string", description: "Name of the item (e.g., 'Eggs', 'Milk')" },
                                category: { type: "string", description: "Category (e.g., 'Dairy', 'Protein', 'Veggie'). Default to 'Outros'." },
                            },
                            required: ["name"]
                        }
                    }
                },
                required: ["items"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_pantry_items",
            description: "Get a list of items currently in the user's pantry to suggest recipes.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    }
];

export async function sendMessage(history: { role: string; content: string }[]) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser) throw new Error("User not found");

    // Fetch Context
    const lastWeightLog = await db.query.dailyMetrics.findFirst({
        where: eq(dailyMetrics.userId, dbUser.id),
        orderBy: (metrics, { desc }) => [desc(metrics.date)],
    });

    const recentMeals = await db.query.meals.findMany({
        where: eq(meals.userId, dbUser.id),
        orderBy: (meals, { desc }) => [desc(meals.createdAt)],
        limit: 5,
    });

    const recentExercises = await db.query.exercises.findMany({
        where: eq(exercises.userId, dbUser.id),
        orderBy: (exercises, { desc }) => [desc(exercises.startTime)],
        limit: 5,
    });

    const context = `
    User Context:
    - Name: ${dbUser.name}
    - Current Weight: ${lastWeightLog?.weight || dbUser.startWeight} kg
    - Target Weight: ${dbUser.targetWeight} kg
    
    Clinical/Cardiac Profile:
    - Protocol Method: ${dbUser.protocolMethod || 'N/A'}
    - Resting HR: ${dbUser.restingHr || 'N/A'} bpm
    - Max HR: ${dbUser.maxHr || 'N/A'} bpm
    - VT1 (Limiar 1): ${dbUser.ft1Bpm || 'N/A'} bpm
    - VT2 (Limiar 2): ${dbUser.ft2Bpm || 'N/A'} bpm
    - Peak METs: ${dbUser.metPeak || 'N/A'}
    - Peak VO2: ${dbUser.vo2Peak || 'N/A'} ml/kg/min
    - Recent Meals:
    ${recentMeals.map(m => `  - [${m.type}] ${m.qualityScore}/10 score: ${m.aiFeedback} (${m.calories}kcal)`).join("\n")}
    - Recent Workouts:
    ${recentExercises.map(e => {
        const duration = e.endTime && e.startTime ? Math.round((new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / 60000) : 0;
        return `  - [${e.type}] ${duration}min, ${e.calories}kcal, RPE:${e.rpe || 'N/A'}/10, Feeling:${e.feeling || 'N/A'}`;
    }).join("\n")}
    `;

    const { getSystemPrompt } = await import("@/lib/ai/prompts");
    const systemPrompt = getSystemPrompt(context);

    let model = dbUser?.aiModel || "google/gemini-2.0-flash-001";
    if (model === "free") model = "google/gemini-2.0-flash-001";
    if (model === "paid") return "anthropic/claude-3.5-sonnet"; // paid alias shouldn't happen usually but good safety
    if (model === "glm-4") model = "thudm/glm-4-9b-chat";
    if (model === "glm-5" || model === "thudm/glm-5") model = "z-ai/glm-5"; // Fix legacy/stored ID

    const messages: any[] = [
        { role: "system", content: systemPrompt },
        ...history
    ];

    console.log("Sending to AI:", model);

    // 1. First Call to LLM
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://vitalos.app",
            "X-Title": "VitalOS",
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            tools: tools,
            tool_choice: "auto"
        })
    });

    if (!response.ok) {
        const error = await response.text();
        console.error("AI Error:", error);
        throw new Error(`OpenRouter Error: ${response.status} - ${error}`);
    }

    const json = await response.json();
    const responseMessage = json.choices[0].message;

    console.log("AI Response:", responseMessage);

    // 2. Handle Tool Calls
    if (responseMessage.tool_calls) {
        const toolCalls = responseMessage.tool_calls;
        console.log("Tool Calls Detected:", toolCalls.length);

        // Append assistant's tool call request to history
        messages.push(responseMessage);

        for (const toolCall of toolCalls) {
            // Handle Add Shopping Items
            if (toolCall.function.name === "add_shopping_items") {
                try {
                    const args = JSON.parse(toolCall.function.arguments);
                    console.log("Adding items:", args.items);
                    const itemsToAdd = args.items;

                    await Promise.all(itemsToAdd.map(async (item: any) => {
                        await addKitchenItem(item.name, item.category || "Outros", "shopping_list");
                    }));

                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify({ success: true, added_count: itemsToAdd.length })
                    });
                } catch (e) {
                    console.error("Tool Execution Error:", e);
                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify({ success: false, error: "Failed to add items" })
                    });
                }
            }

            // Handle Get Pantry Items
            if (toolCall.function.name === "get_pantry_items") {
                try {
                    console.log("Fetching Pantry Items...");
                    // We can query DB directly here since we are on server
                    const pantryItems = await db.query.kitchenItems.findMany({
                        where: and(
                            eq(kitchenItems.userId, dbUser.id),
                            eq(kitchenItems.status, "pantry")
                        )
                    });

                    const itemNames = pantryItems.map(i => i.name).join(", ");
                    console.log("Pantry Items Found:", itemNames);

                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify({ success: true, items: itemNames || "Despensa vazia." })
                    });
                } catch (e) {
                    console.error("Pantry Fetch Error:", e);
                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify({ success: false, error: "Failed to fetch pantry" })
                    });
                }
            }
        }

        // 3. Second Call to LLM (Get final confirmation message)
        const secondResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://vitalos.app",
                "X-Title": "VitalOS",
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                // We keep tools available in case it wants to do more (unlikely) or just to be consistent
                tools: tools,
                tool_choice: "auto"
            })
        });

        if (!secondResponse.ok) {
            return "Concluí a ação, mas tive um erro ao gerar a resposta final.";
        }

        const secondJson = await secondResponse.json();
        return secondJson.choices[0].message.content;
    }

    return responseMessage.content;
}
