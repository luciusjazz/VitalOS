import { ManualExerciseForm } from "@/components/manual-exercise-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function TrackExercisePage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
            <div className="mb-6 flex items-center">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold ml-2">Registrar Exercício</h1>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm max-w-md mx-auto mb-6 border border-slate-100 dark:border-slate-800">
                <ManualExerciseForm />
            </div>
        </div>
    );
}
