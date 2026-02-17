import { OnboardingForm } from "@/components/onboarding-form";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function OnboardingPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    // Check if already onboarded
    const existingUser = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);
    if (existingUser.length > 0 && existingUser[0].tmb) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Bem-vindo ao VitalOS</h1>
                <p className="text-muted-foreground">Seu sistema operacional para uma vida plena.</p>
            </div>
            <OnboardingForm />
        </div>
    );
}
