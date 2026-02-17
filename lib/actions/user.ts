"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { OnboardingData, onboardingSchema } from "@/lib/validations/onboarding";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function submitOnboarding(data: OnboardingData) {
    const user = await currentUser();

    if (!user) {
        throw new Error("User not found");
    }

    const validated = onboardingSchema.parse(data);

    // Calculate TMB (Harris-Benedict simplified)
    let tmb = 0;
    if (validated.gender === "male") {
        tmb = 88.36 + (13.4 * validated.weight) + (4.8 * validated.height) - (5.7 * validated.age);
    } else {
        tmb = 447.6 + (9.2 * validated.weight) + (3.1 * validated.height) - (4.3 * validated.age);
    }

    // Adjust for activity
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
    };

    const finalTmb = Math.round(tmb * activityMultipliers[validated.activityLevel]);

    // Upsert user
    await db.insert(users).values({
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName + " " + user.lastName,
        gender: validated.gender,
        // birthday calculation is approximate from age for MVP simplicity, or we store age. Schema has birthday. 
        // Let's store DOB as Jan 1st of estimated year for now or update schema to just store Age if user provided Age.
        // Task: "TMB, Peso, Cronotipo". Schema has 'birthday'. Let's stick to the schema and estimate or just store null birthday and rely on entered age for now if schema allows.
        // Actually schema `birthday` is date.
        // Let's modify the action to accept birthday if the form sends it, or just use age for TMB and save current year - age.
        // For MVP, capturing Age in form is easier.
        height: validated.height,
        startWeight: validated.weight,
        targetWeight: validated.goalWeight,
        activityLevel: validated.activityLevel,
        tmb: finalTmb,
    }).onConflictDoUpdate({
        target: users.clerkId,
        set: {
            height: validated.height,
            targetWeight: validated.goalWeight,
            activityLevel: validated.activityLevel,
            tmb: finalTmb,
            updatedAt: new Date(),
        }
    });

    redirect("/dashboard");
}

export async function updateUserProfile(data: {
    name: string;
    height: number;
    targetWeight: number;
    dietaryPreferences: string;
    workoutDays: number;
    workoutPreferences: string;
    stepGoal: number;
    activityLevel?: string;
}) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    await db.update(users)
        .set({
            name: data.name,
            height: data.height,
            targetWeight: data.targetWeight,
            dietaryPreferences: data.dietaryPreferences,
            workoutDays: data.workoutDays,
            workoutPreferences: data.workoutPreferences,
            stepGoal: data.stepGoal,
            activityLevel: data.activityLevel,
            updatedAt: new Date(),
        })
        .where(eq(users.clerkId, user.id));

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard");
    revalidatePath("/settings/profile");
    return { success: true };
}

export async function updateCardiacProfile(data: {
    protocolMethod: "manual" | "cpet" | "ergometry" | "no_test";
    hrRest: number;
    hrPeak?: number; // Required for CPET, Ergometry
    metPeak?: number; // Required for Ergometry
    ft1Bpm?: number; // Manual or CPET
    ft2Bpm?: number; // Manual or CPET
    vo2Peak?: number; // CPET
    age?: number; // For "No Test" MaxHR reference (optional)
}) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    let ft1 = data.ft1Bpm;
    let ft2 = data.ft2Bpm;
    let maxHr = data.hrPeak;

    // Calculation Logic
    if (data.protocolMethod === "no_test") {
        // Guideline: RHR + 20 to RHR + 30
        ft1 = data.hrRest + 20;
        ft2 = data.hrRest + 30;
        // Estimate Max HR if not provided (Tanaka or 220-age)
        if (!maxHr && data.age) {
            maxHr = 220 - data.age;
        }
    } else if (data.protocolMethod === "ergometry") {
        // Milani Equations (2023)
        // HR at VT1 = 3.453 + (0.887 * HRpeak) - (0.555 * (HRpeak - HRrest)) + (1.044 * METpeak)
        // HR at VT2 = -8.256 + (0.979 * HRpeak) - (0.232 * (HRpeak - HRrest)) + (1.418 * METpeak)

        if (data.hrPeak && data.metPeak) {
            const reserve = data.hrPeak - data.hrRest;
            ft1 = Math.round(3.453 + (0.887 * data.hrPeak) - (0.555 * reserve) + (1.044 * data.metPeak));
            ft2 = Math.round(-8.256 + (0.979 * data.hrPeak) - (0.232 * reserve) + (1.418 * data.metPeak));
        }
    }
    // CPET: Uses provided ft1, ft2. Manual: Uses provided ft1, ft2.

    await db.update(users)
        .set({
            protocolMethod: data.protocolMethod,
            restingHr: data.hrRest,
            maxHr: maxHr,
            metPeak: data.metPeak,
            vo2Peak: data.vo2Peak,
            ft1Bpm: ft1,
            ft2Bpm: ft2,
            updatedAt: new Date(),
        })
        .where(eq(users.clerkId, user.id));

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/settings/cardiac-profile");

    return { success: true, ft1, ft2 };
}
