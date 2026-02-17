"use server";

import { db } from "@/lib/db";
import { exercises } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function logExercise(data: {
    type: string;
    source: string;
    startTime: Date;
    endTime: Date;
    avgHr?: number;
    maxHr?: number;
    calories?: number;
    notes?: string;
    externalId?: string;
    rpe?: number;
    feeling?: string;
}) {
    console.log("[logExercise] Received data:", data);

    const { userId } = await auth();
    if (!userId) {
        console.error("[logExercise] No userId from auth()");
        throw new Error("Unauthorized");
    }

    const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkId, userId),
    });

    if (!user) {
        console.error("[logExercise] User not found in DB for Clerk ID:", userId);
        throw new Error("User not found");
    }

    // Check for duplicates if externalId provided
    if (data.externalId) {
        const existing = await db.query.exercises.findFirst({
            where: (exercises, { eq, and }) => and(
                eq(exercises.externalId, data.externalId!),
                eq(exercises.userId, user.id)
            )
        });
        if (existing) {
            console.log("Exercise already exists:", data.externalId);
            return { success: true, id: existing.id, isDuplicate: true };
        }
    }

    try {
        const [inserted] = await db.insert(exercises).values({
            userId: user.id,
            type: data.type,
            source: data.source || "manual",
            startTime: data.startTime,
            endTime: data.endTime,
            avgHr: data.avgHr,
            maxHr: data.maxHr,
            calories: data.calories,
            externalId: data.externalId,
            rpe: data.rpe,
            feeling: data.feeling,
        }).returning();

        console.log("[logExercise] Successfully inserted:", inserted.id);
        revalidatePath("/dashboard");
        revalidatePath("/workout");
        return { success: true, id: inserted.id };
    } catch (dbError) {
        console.error("[logExercise] DB Insert Error:", dbError);
        throw dbError;
    }
}

export async function syncGoogleFitExercises(googleSessions: any[]) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkId, userId),
    });
    if (!user) return { success: false, error: "User not found" };

    let count = 0;
    for (const session of googleSessions) {
        // Map Google type to our type
        // Session: { googleId, name, activityType, startTime, endTime, durationMinutes }

        // Skip if exists
        const existing = await db.query.exercises.findFirst({
            where: (exercises, { eq, and }) => and(
                eq(exercises.externalId, session.googleId),
                eq(exercises.userId, user.id)
            )
        });

        if (!existing) {
            await db.insert(exercises).values({
                userId: user.id,
                type: session.activityType, // e.g., "Walking", "Running"
                source: "google_fit",
                externalId: session.googleId,
                startTime: session.startTime,
                endTime: session.endTime,
                // calories: session.calories // if we had it
            });
            count++;
        }
    }

    revalidatePath("/dashboard");
    return { success: true, count };
}
