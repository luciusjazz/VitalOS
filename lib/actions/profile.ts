"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: any) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Resolve internal user ID
    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
    });

    if (!dbUser) throw new Error("User not found");

    await db.update(users).set({
        name: data.name,
        height: data.height ? parseInt(data.height) : null,
        startWeight: data.startWeight ? parseFloat(data.startWeight) : null,
        targetWeight: data.targetWeight ? parseFloat(data.targetWeight) : null,
        birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : null,
        maxHr: data.maxHr ? parseInt(data.maxHr) : null,
        restingHr: data.restingHr ? parseInt(data.restingHr) : null,
        updatedAt: new Date(),
    }).where(eq(users.id, dbUser.id));

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
}
