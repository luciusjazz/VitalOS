"use server";

import { db } from "@/lib/db";
import { meals, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteMeal(mealId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, userId)
    });

    if (!dbUser) throw new Error("User not found");

    await db.delete(meals)
        .where(and(
            eq(meals.id, mealId),
            eq(meals.userId, dbUser.id)
        ));

    revalidatePath("/meals");
    revalidatePath("/dashboard");
}

export async function updateMeal(mealId: string, data: {
    description?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    type?: string;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, userId)
    });

    if (!dbUser) throw new Error("User not found");

    await db.update(meals)
        .set({
            aiFeedback: data.description, // Mapping description to feedback/title for now or we should add a 'name' field? 
            // Schema has `aiFeedback` (text) and `type`.
            // Let's use `aiFeedback` to store the custom name if the user edits it, 
            // or we might want to add a proper `name` column.
            // For now, let's assume editing 'aiFeedback' acts as the description.
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat,
            type: data.type,
        })
        .where(and(
            eq(meals.id, mealId),
            eq(meals.userId, dbUser.id)
        ));

    revalidatePath("/meals");
    revalidatePath("/dashboard");
}
