"use server";

import { db } from "@/lib/db";
import { meals, users } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toZonedTime } from "date-fns-tz";

export async function analyzeFood(formData: FormData) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const file = formData.get("image") as File | null;
    const textInput = formData.get("text") as string | null;
    const additionalPrompt = formData.get("additionalPrompt") as string | null;

    if (!file && !textInput) throw new Error("No image or text provided");

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser) throw new Error("User not found");

    // Vision Capable Models
    const VISION_MODELS = [
        "google/gemini-2.0-flash-001",
        "anthropic/claude-3.5-sonnet",
        "qwen/qwen3-vl-235b-a22b-thinking",
        "thudm/glm-4v-9b" // Vision capable GLM
    ];

    let model = dbUser?.aiModel || "google/gemini-2.0-flash-001";

    // Handle legacy values
    if (model === "free") model = "google/gemini-2.0-flash-001";
    if (model === "paid") model = "anthropic/claude-3.5-sonnet";

    // Fallback if user selected a text-only model (like Llama)
    if (!VISION_MODELS.includes(model)) {
        console.log(`Model ${model} is not vision-capable. Falling back to Gemini Flash.`);
        model = "google/gemini-2.0-flash-001";
    }

    let messages: any[] = [];
    const systemPrompt = "You are an expert nutritionist AI. Your task is to analyze food images OR text descriptions and provide nutritional data. \nCRITICAL: Return ONLY valid JSON. No markdown formatting, no code blocks, no introductory text.\n\nStructure:\n{\n  \"calories\": number (be realistic, average portions),\n  \"protein\": number (grams),\n  \"carbs\": number (grams),\n  \"fat\": number (grams),\n  \"foodName\": string (Short descriptive name in PT-BR, e.g., 'Panqueca Low Carb'),\n  \"qualityScore\": number (1-10 based on whole food density, fiber, and processing level. 10 = Vegetables/Proteins, 1 = Processed Sugar),\n  \"feedback\": string (1 short sentence in Portuguese/PT-BR about the quality)\n}";

    if (file) {
        // Image Analysis
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const dataUrl = `data:${file.type};base64,${base64}`;

        let userContent = "Analyze this image. Estimate calories and macros for a standard serving size visible.";
        if (additionalPrompt) {
            userContent += `\n\nUSER CORRECTION/CONTEXT: ${additionalPrompt}.\nTake this correction as absolute truth (e.g., if user says it's 'low carb', reduce carbs drastically).`;
        }

        messages = [
            { role: "system", content: systemPrompt },
            {
                role: "user",
                content: [
                    { type: "text", text: userContent },
                    { type: "image_url", image_url: { url: dataUrl } }
                ]
            }
        ];
    } else if (textInput) {
        // Text Analysis
        messages = [
            { role: "system", content: systemPrompt },
            {
                role: "user",
                content: textInput
            }
        ];
    }

    // Call OpenRouter
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
            messages: messages
        })
    });

    if (!response.ok) {
        console.error("OpenRouter Error", await response.text());
        throw new Error("Failed to analyze image");
    }

    const json = await response.json();
    const content = json.choices[0].message.content.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(content);

    // Determine meal type based on hour
    const hour = toZonedTime(new Date(), 'America/Sao_Paulo').getHours();
    let type = "snack";
    if (hour >= 5 && hour < 11) type = "breakfast";
    else if (hour >= 11 && hour < 15) type = "lunch";
    else if (hour >= 18 && hour < 22) type = "dinner";

    return { ...analysis, type };
}

export async function saveMeal(data: any) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser) throw new Error("User not found");

    await db.insert(meals).values({
        userId: dbUser.id,
        type: data.type || "snack",
        photoUrl: data.photoUrl || null,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        qualityScore: data.qualityScore,
        aiFeedback: data.feedback || data.foodName, // Use feedback or name as description
    });

    revalidatePath("/dashboard");
    revalidatePath("/meals");
}
