"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { kitchenItems, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getKitchenItems() {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, userId)
    });

    if (!dbUser) return { success: false, error: "User not found" };

    const items = await db.query.kitchenItems.findMany({
        where: eq(kitchenItems.userId, dbUser.id),
        orderBy: [desc(kitchenItems.createdAt)]
    });

    return { success: true, data: items };
}

export async function addKitchenItem(name: string, category: string = "Outros", status: "shopping_list" | "pantry" = "shopping_list") {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, userId)
    });

    if (!dbUser) return { success: false, error: "User not found" };

    await db.insert(kitchenItems).values({
        userId: dbUser.id,
        name,
        category,
        status
    });

    revalidatePath("/shopping");
    return { success: true };
}

export async function toggleItemStatus(itemId: string, currentStatus: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const newStatus = currentStatus === "shopping_list" ? "pantry" : "shopping_list";

    await db.update(kitchenItems)
        .set({ status: newStatus })
        .where(eq(kitchenItems.id, itemId));

    revalidatePath("/shopping");
    return { success: true, newStatus };
}

export async function consumeItem(itemId: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    // Mark as consumed (or delete? For now delete to keep it simple, or move to shopping list?)
    // Logic: If in pantry and consumed -> user might want to buy again. 
    // Let's move to shopping list for now implies "Ran out".

    await db.update(kitchenItems)
        .set({ status: "shopping_list" })
        .where(eq(kitchenItems.id, itemId));

    revalidatePath("/shopping");
    return { success: true };
}

export async function deleteKitchenItem(itemId: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await db.delete(kitchenItems).where(eq(kitchenItems.id, itemId));

    revalidatePath("/shopping");
    return { success: true };
}
