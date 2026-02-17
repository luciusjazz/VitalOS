import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getKitchenItems } from "@/lib/actions/kitchen";
import { ShoppingListClient } from "@/components/shopping-list-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ShoppingPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const { data: items } = await getKitchenItems();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-20">
            <div className="mb-4 flex items-center gap-2">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold">Compras & Despensa</h1>
            </div>

            <ShoppingListClient initialItems={items || []} />
        </div>
    );
}
