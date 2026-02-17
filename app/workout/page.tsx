
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, exercises } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Activity, Play, Settings, History, TrendingUp, HeartPulse, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GoogleFitSyncCard } from "@/components/google-fit-sync-card";

export default async function WorkoutPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser) redirect("/onboarding");

    // Fetch workouts
    const workouts = await db.query.exercises.findMany({
        where: eq(exercises.userId, dbUser.id),
        orderBy: (exercises, { desc }) => [desc(exercises.startTime)],
        limit: 20,
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans">
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="-ml-2">
                                <ChevronLeft className="w-6 h-6 text-slate-500" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Activity className="w-6 h-6 text-orange-600" />
                            Treinos
                        </h1>
                    </div>
                    <Link href="/settings/cardiac-profile">
                        <Button variant="ghost" size="icon">
                            <Settings className="w-5 h-5 text-slate-500" />
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-6">

                {/* Hero Action: Start Live Workout */}
                <section className="grid grid-cols-1 gap-4">
                    <Link href="/track/live">
                        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Activity className="w-32 h-32" />
                            </div>
                            <CardContent className="p-6 flex flex-col items-center text-center relative z-10">
                                <div className="bg-white/20 p-4 rounded-full mb-4 backdrop-blur-sm animate-pulse">
                                    <Play className="w-8 h-8 fill-current" />
                                </div>
                                <h2 className="text-2xl font-bold mb-1">Iniciar Treino</h2>
                                <p className="text-orange-100 text-sm">Monitoramento em tempo real (Polar H10)</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/track/exercise">
                        <Button variant="outline" className="w-full h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold">Inserir Manualmente</span>
                        </Button>
                    </Link>
                </section>

                {/* Google Fit Status */}
                <section>
                    <GoogleFitSyncCard />
                </section>

                {/* Recent History */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <History className="w-5 h-5" />
                            Histórico
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {workouts.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Nenhum treino registrado ainda.</p>
                            </div>
                        ) : (
                            workouts.map((workout) => (
                                <Card key={workout.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-3 rounded-xl",
                                                workout.source === 'google_fit' ? "bg-green-100 text-green-600 dark:bg-green-900/30" :
                                                    workout.source === 'live_tracking' ? "bg-red-100 text-red-600 dark:bg-red-900/30" :
                                                        "bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                                            )}>
                                                {workout.source === 'google_fit' ? <TrendingUp className="w-5 h-5" /> :
                                                    workout.source === 'live_tracking' ? <HeartPulse className="w-5 h-5" /> :
                                                        <Activity className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 capitalize">
                                                    {workout.type}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                    <span>{workout.startTime.toLocaleDateString('pt-BR')}</span>
                                                    <span>•</span>
                                                    <span>{Math.round((workout.endTime.getTime() - workout.startTime.getTime()) / 60000)} min</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            {workout.calories && (
                                                <div className="font-bold text-orange-600 dark:text-orange-500">
                                                    {workout.calories} <span className="text-[10px] font-normal text-slate-400">kcal</span>
                                                </div>
                                            )}
                                            {workout.avgHr && (
                                                <div className="text-xs text-slate-400 mt-1">
                                                    {workout.avgHr} bpm
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
