
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ChevronLeft, Brain } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AIModelSelector } from "@/components/ai-model-selector";

export default async function AISettingsPage() {
    const { userId } = await auth();
    if (!userId) redirect("/");

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
    });

    if (!dbUser) redirect("/");

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/settings/profile">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Brain className="w-6 h-6 text-blue-600" />
                        <h1 className="text-2xl font-bold">Configurações de IA</h1>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border shadow-sm">
                    <p className="text-sm text-slate-500 mb-6">
                        Escolha o modelo de inteligência artificial que o Coach VitalOS usará para analisar seus treinos, dieta e fornecer orientações.
                    </p>
                    <AIModelSelector initialModel={dbUser.aiModel || "free"} />
                </div>
            </div>
        </div>
    );
}
