"use server";

import { db } from "@/lib/db";
import { shoppingItems, users } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getShoppingList() {
    const user = await currentUser();
    if (!user) return [];

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser) return [];

    return await db.select().from(shoppingItems)
        .where(eq(shoppingItems.userId, dbUser.id))
        .orderBy(desc(shoppingItems.createdAt));
}

export async function toggleItem(id: string, isChecked: boolean) {
    await db.update(shoppingItems)
        .set({ isChecked })
        .where(eq(shoppingItems.id, id));
    revalidatePath("/shopping");
}

export async function addItem(item: string) {
    const user = await currentUser();
    if (!user) return;

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser) return;

    await db.insert(shoppingItems).values({
        userId: dbUser.id,
        item,
        category: "general",
    });
    revalidatePath("/shopping");
}

export async function generateSmartList() {
    // MVP: Adds a default healthy kit
    const user = await currentUser();
    if (!user) return;

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser) return;

    const healthyBasics = [
        "Ovos", "Frango", "Peixe", "Espinafre", "Brócolis",
        "Abacate", "Azeite de Oliva", "Nozes", "Frutas Vermelhas"
    ];

    for (const item of healthyBasics) {
        await db.insert(shoppingItems).values({
            userId: dbUser.id,
            item,
            category: "suggestion",
        });
    }
    revalidatePath("/shopping");
}
