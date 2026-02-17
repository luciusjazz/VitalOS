import { db } from "@/lib/db";
import { dailyMetrics, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email, secret, steps, sleep, date } = await req.json();

        // Basic Auth via secret/email for MVP (In prod, use a generated API Key per user)
        // For now, we will assume the user sends their Clerk Email + a simple shared secret or just ID if we want to be insecure for prototype.
        // Let's use Email for lookup.

        if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

        const dbUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const targetDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        // Find existing metric
        const existing = await db.query.dailyMetrics.findFirst({
            where: and(
                eq(dailyMetrics.userId, dbUser.id),
                eq(dailyMetrics.date, targetDate)
            )
        });

        if (existing) {
            await db.update(dailyMetrics).set({
                steps: steps || existing.steps,
                sleepHours: sleep || existing.sleepHours,
            }).where(eq(dailyMetrics.id, existing.id));
        } else {
            await db.insert(dailyMetrics).values({
                userId: dbUser.id,
                date: targetDate,
                steps: steps,
                sleepHours: sleep,
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
