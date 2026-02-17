
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardiacProfileForm } from "@/components/cardiac-profile-form";

export default async function CardiacProfilePage() {
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
                    <h1 className="text-2xl font-bold">Protocolo Cardíaco</h1>
                </div>

                <CardiacProfileForm user={dbUser} />
            </div>
        </div>
    );
}
