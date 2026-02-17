"use server";

import { db } from "@/lib/db";
import { exercises, users } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

// Fetch all exercises for a given month (to show dots on calendar)
export async function getMonthExercises(date: Date) {
    const user = await currentUser();
    if (!user) return [];

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });
    if (!dbUser) return [];

    const start = startOfMonth(date);
    const end = endOfMonth(date);

    // Note: Database dates are usually UTC or server time. 
    // Ideally we should handle timezone carefully.
    // For now, fetching a broad range is safer.

    const monthExercises = await db.query.exercises.findMany({
        where: and(
            eq(exercises.userId, dbUser.id),
            gte(exercises.startTime, start),
            lte(exercises.startTime, end)
        ),
        columns: {
            id: true,
            startTime: true,
            type: true,
            calories: true,
        }
    });

    return monthExercises;
}

// Fetch exercises for a specific day
export async function getDayExercises(date: Date) {
    const user = await currentUser();
    if (!user) return [];

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });
    if (!dbUser) return [];

    const start = startOfDay(date);
    const end = endOfDay(date);

    const dayExercises = await db.query.exercises.findMany({
        where: and(
            eq(exercises.userId, dbUser.id),
            gte(exercises.startTime, start),
            lte(exercises.startTime, end)
        ),
        orderBy: [desc(exercises.startTime)],
    });

    return dayExercises;
}

// Get weekly summary stats (current week)
export async function getWeeklyStats() {
    // Basic implementation: fetch last 7 days and aggregate
    const user = await currentUser();
    if (!user) return { minutes: 0, calories: 0, count: 0 };

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });
    if (!dbUser) return { minutes: 0, calories: 0, count: 0 };

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    const weekExercises = await db.query.exercises.findMany({
        where: and(
            eq(exercises.userId, dbUser.id),
            gte(exercises.startTime, start),
        )
    });

    let minutes = 0;
    let calories = 0;

    weekExercises.forEach(ex => {
        if (ex.endTime && ex.startTime) {
            const duration = (ex.endTime.getTime() - ex.startTime.getTime()) / 1000 / 60;
            minutes += duration;
        }
        if (ex.calories) {
            calories += ex.calories;
        }
    });

    return {
        minutes: Math.round(minutes),
        calories: Math.round(calories),
        count: weekExercises.length
    };
}
