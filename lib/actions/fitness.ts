"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { getGoogleFitData } from "@/lib/google-fit";
import { db } from "@/lib/db";
import { dailyMetrics, users, workouts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function syncGoogleFit() {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    // 1. Get Google Access Token from Clerk
    const client = await clerkClient();
    let token: string | undefined;

    try {
        const tokenResponse = await client.users.getUserOauthAccessToken(userId, "oauth_google");
        console.log("Clerk Token Response Length:", tokenResponse.data.length);
        token = tokenResponse.data[0]?.token;

        if (!token) {
            console.error("Clerk: No Google Token found.");
            return { success: false, error: "Conecte o Google Fit nas Configurações novamente." };
        }
    } catch (err) {
        console.error("Clerk Token Error:", err);
        return { success: false, error: `Erro de Autenticação: ${err instanceof Error ? err.message : "Desconhecido"}` };
    }

    // 2. Fetch Data from Google Fit
    try {
        const fitData = await getGoogleFitData(token);
        console.log("Google Fit Data:", fitData);

        // 3. Save to DB
        const dbUser = await db.query.users.findFirst({
            where: eq(users.clerkId, userId)
        });

        if (!dbUser) throw new Error("User not found in DB");

        const { getBrazilTodayStr } = await import("@/lib/date-utils");
        const today = getBrazilTodayStr();

        // Check if metric exists for today
        const existing = await db.query.dailyMetrics.findFirst({
            where: and(
                eq(dailyMetrics.userId, dbUser.id),
                eq(dailyMetrics.date, today)
            )
        });

        if (existing) {
            await db.update(dailyMetrics).set({
                steps: fitData.steps,
                caloriesBurned: fitData.calories,
            }).where(eq(dailyMetrics.id, existing.id));
        } else {
            await db.insert(dailyMetrics).values({
                userId: dbUser.id,
                date: today,
                steps: fitData.steps,
                caloriesBurned: fitData.calories,
            });
        }

        // 4. Sync Sessions (Workouts)
        const { getGoogleFitSessions, getGoogleFitActivitySummary } = await import("@/lib/google-fit");
        let sessions = await getGoogleFitSessions(token);
        let source = "session";

        // Fallback: If no official sessions, check for long activity segments (Auto-detected walks > 15min)
        if (sessions.length === 0) {
            console.log("No sessions found. Checking activity summary...");
            const activities = await getGoogleFitActivitySummary(token);
            // Map activities to "session-like" objects for DB
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            // Filter out "Sleeping" (72) or "Still" (3) if they appear
            const validActivities = activities.filter((a: any) => a.activityId !== 72 && a.activityId !== 3);

            sessions = validActivities.map((a: any) => ({
                googleId: `auto-${todayStart.toISOString()}-${a.activityId}`, // Mock ID
                name: `${a.name} (Auto)`,
                activityType: a.name,
                startTime: todayStart, // We don't have exact start time from summary bucket, just duration. defaulting to start of day for list is ugly but functional.
                // Ideally we'd use 'bucketByTime' with activity segment to get start time. 
                // But for summary, let's just make it a "Daily Summary" entry.
                endTime: new Date(),
                durationMinutes: a.durationMinutes,
                calories: 0
            }));
            if (sessions.length > 0) source = "summary";
        }

        console.log("Found Workouts/Activities:", sessions.length);

        // Call the Exercise Sync Logic
        const { syncGoogleFitExercises } = await import("./exercise");
        const syncResult = await syncGoogleFitExercises(sessions);
        console.log("Exercises Synced to DB:", syncResult);

        revalidatePath("/dashboard");
        return {
            success: true,
            steps: fitData.steps,
            sessionsCount: sessions.length,
            debugRaw: fitData.raw,
            source: source
        };

    } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error("Fit API Error Detail:", msg);
        if (msg.includes("401")) return { success: false, error: "Token expirou. Faça login novamente." };
        return { success: false, error: `Fit API Error: ${msg}` };
    }
}
