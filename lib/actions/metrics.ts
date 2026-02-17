"use server";

import { db } from "@/lib/db";
import { dailyMetrics, users } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logWeight(data: { weight: number; date: Date; mood?: string; energy?: number }) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser) throw new Error("User not found");

    // Always insert new log to allow multiple entries per day
    await db.insert(dailyMetrics).values({
        userId: dbUser.id,
        date: data.date.toISOString().split('T')[0],
        weight: data.weight,
        mood: data.mood,
        energyLevel: data.energy,
    });

    revalidatePath("/dashboard");
    redirect("/dashboard");
}

export async function getWeightHistory() {
    const user = await currentUser();
    if (!user) return [];

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser) return [];

    const history = await db.select({
        id: dailyMetrics.id,
        date: dailyMetrics.date,
        weight: dailyMetrics.weight,
    })
        .from(dailyMetrics)
        .where(eq(dailyMetrics.userId, dbUser.id))
        .orderBy(desc(dailyMetrics.date), desc(dailyMetrics.createdAt))
        .limit(30);

    return history;
}

export async function deleteWeightLog(id: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser) throw new Error("User not found");

    await db.delete(dailyMetrics)
        .where(and(
            eq(dailyMetrics.id, id),
            eq(dailyMetrics.userId, dbUser.id) // Ensure ownership
        ));

    revalidatePath("/dashboard");
    revalidatePath("/track/weight");
}
