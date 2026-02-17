import { ChatInterface } from "@/components/chat-interface";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CoachPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-0">
            <div className="mb-2 flex items-center">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold ml-2">VitalOS Coach</h1>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-t-xl shadow-sm max-w-md mx-auto h-full overflow-hidden border border-b-0">
                <ChatInterface />
            </div>
        </div>
    );
}
