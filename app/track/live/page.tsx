import { LiveWorkoutCockpit } from "@/components/live-workout-cockpit";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function LiveWorkoutPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
    });

    if (!dbUser) redirect("/onboarding");

    // Calculate Age
    let age = 30; // Default
    if (dbUser.birthDate) {
        // birthDate is likely a string "YYYY-MM-DD" if it's from `date` column, or Date object?
        // Drizzle `date` usually returns string.
        const birth = new Date(dbUser.birthDate);
        if (!isNaN(birth.getTime())) {
            const diff = Date.now() - birth.getTime();
            age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        }
    }

    // Defaults
    const maxHr = dbUser.maxHr || (220 - age);
    const restingHr = dbUser.restingHr || 60;
    const weight = dbUser.startWeight || 70; // fallback to start weight if current not avail in this context easily, or could fetch last weight

    return (
        <LiveWorkoutCockpit
            maxHr={maxHr}
            restingHr={restingHr}
            weight={weight}
            age={age}
            ft1={dbUser.ft1Bpm || undefined}
            ft2={dbUser.ft2Bpm || undefined}
        />
    );
}
