import { SettingsForm } from "@/components/settings-form";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ChevronLeft, Zap, Brain } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfileSettingsPage() {
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
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Meu Perfil e Metas</h1>
                </div>

                <SettingsForm user={dbUser} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pb-8">
                    <Link href="/settings/cardiac-profile">
                        <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50/50 transition-all">
                            <Zap className="w-6 h-6 text-blue-600" />
                            <div className="text-center">
                                <div className="font-bold">Protocolo Cardíaco</div>
                                <div className="text-xs text-slate-500 font-normal">Zonas de FC e Metodologia</div>
                            </div>
                        </Button>
                    </Link>

                    <Link href="/settings/ai">
                        <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50/50 transition-all">
                            <Brain className="w-6 h-6 text-blue-600" />
                            <div className="text-center">
                                <div className="font-bold">Inteligência Artificial</div>
                                <div className="text-xs text-slate-500 font-normal">Escolher Modelo e IA</div>
                            </div>
                        </Button>
                    </Link>
                </div>

            </div>
        </div>
    );
}
