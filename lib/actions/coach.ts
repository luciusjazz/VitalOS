"use server";

import { db } from "@/lib/db";
import { users, dailyMetrics, coachInsights } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";
import { getBrazilTodayStr } from "@/lib/date-utils";
import { getModel } from "@/lib/ai/models";
import { generateText } from "ai";

export async function getDailyInsight() {
    const user = await currentUser();
    if (!user) return null;

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser) return null;

    const todayStr = getBrazilTodayStr();

    // Check if insight already exists for today
    const existingInsight = await db.query.coachInsights.findFirst({
        where: and(
            eq(coachInsights.userId, dbUser.id),
            eq(coachInsights.date, todayStr)
        ),
    });

    if (existingInsight) {
        return existingInsight;
    }

    // Determine if it's the first time (Welcome message)
    // Check if there are ANY past metrics
    const pastMetrics = await db.query.dailyMetrics.findMany({
        where: eq(dailyMetrics.userId, dbUser.id),
        orderBy: [desc(dailyMetrics.date)],
        limit: 1,
    });

    let prompt = "";
    let type = "morning_brief";
    const lastMetric = pastMetrics[0];

    if (!lastMetric) {
        // First access or no data yet
        type = "welcome";
        prompt = `
        You are an elite health coach named Vital.
        The user ${dbUser.name} just started using the app today.
        Their goal is to reach ${dbUser.targetWeight}kg (current: ${dbUser.startWeight}kg).
        Height: ${dbUser.height}cm.
        Activity Level: ${dbUser.activityLevel}.
        Workout Days/Week: ${dbUser.workoutDays}.
        Dietary Prefs: ${dbUser.dietaryPreferences}.
        
        Generate a short, high-energy WELCOME message (max 2 sentences).
        Focus on their specific goal and motivation.
        Tone: Professional, encouraging, elite.
        Language: Portuguese (Brazil).
        `;
    } else {
        // Daily brief based on yesterday/recent data
        // Ideally we fetch yesterday's specific data, but for MVP let's look at the "last recorded metric" 
        // which might be yesterday or today if already logged.
        // Let's assume lastMetric IS recent enough to comment on.

        const weightDiff = (dbUser.targetWeight || 0) - (lastMetric.weight || 0);
        const onTrack = Math.abs(weightDiff) < 5; // Simplified logic

        prompt = `
        You are an elite health coach named Vital.
        User: ${dbUser.name}.
        Latest Data:
        - Weight: ${lastMetric.weight}kg
        - Steps: ${lastMetric.steps || 0}
        - Calories Burned: ${lastMetric.caloriesBurned || 0}
        - Sleep: ${lastMetric.sleepHours || 0}h
        - Mood: ${lastMetric.mood || "N/A"}
        
        Generate a daily insight message (max 2 sentences).
        If steps were low (<3000), give a gentle nudge.
        If steps were high (>8000), celebrate.
        If sleep was low (<6h), advise rest.
        Otherwise, focus on consistency towards ${dbUser.targetWeight}kg.
        
        Tone: Professional, concise, impactful.
        Language: Portuguese (Brazil).
        `;
    }

    try {
        const model = getModel(dbUser.aiModel || "free");
        const { text } = await generateText({
            model: model,
            prompt: prompt,
            maxTokens: 150,
            temperature: 0.7,
        });

        // Save to DB
        const [savedInsight] = await db.insert(coachInsights).values({
            userId: dbUser.id,
            date: todayStr,
            message: text.trim(),
            type: type,
        }).returning();

        return savedInsight;

    } catch (error) {
        console.error("Error generating insight:", error);
        return null; // Fail silently in UI or show generic message
    }
}
