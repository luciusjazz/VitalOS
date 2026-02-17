"use server";

import { db } from "@/lib/db";
import { users, dailyMetrics, meals, workouts, kitchenItems, shoppingItems } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateAIModel(model: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    await db.update(users)
        .set({ aiModel: model })
        .where(eq(users.clerkId, user.id));

    revalidatePath("/settings/ai");
    revalidatePath("/dashboard");
}

export async function resetAccountData() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser) throw new Error("User not found");

    // Delete all data associated with user
    await db.delete(dailyMetrics).where(eq(dailyMetrics.userId, dbUser.id));
    await db.delete(meals).where(eq(meals.userId, dbUser.id));
    await db.delete(workouts).where(eq(workouts.userId, dbUser.id));
    await db.delete(kitchenItems).where(eq(kitchenItems.userId, dbUser.id));
    // shoppingItems is deprecated but maybe clear it too if it exists?
    // It's not in the import list of schema check, but let's check imports.
    // Schema has 'shoppingItems'. 
    await db.delete(shoppingItems).where(eq(shoppingItems.userId, dbUser.id));

    // We need to import tables to delete.
    // Ensure all tables are imported in this file.

    revalidatePath("/dashboard");
    return { success: true };
}

export async function getAIModel() {
    const user = await currentUser();
    if (!user) return "free";

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    return dbUser?.aiModel || "free";
}
