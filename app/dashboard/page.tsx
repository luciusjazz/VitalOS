import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, meals, dailyMetrics, exercises } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { MetabolicScore } from "@/components/metabolic-score";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Activity, TrendingUp, ShoppingCart, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { getWeightHistory } from "@/lib/actions/metrics";
import { WeightChart } from "@/components/weight-chart";
import { SyncFitButton } from "@/components/sync-fit-button";
import { AutoSyncFit } from "@/components/auto-sync-fit";
import { MorningBrief } from "@/components/morning-brief";
import { getDailyInsight } from "@/lib/actions/coach";
import { getBrazilTodayStr } from "@/lib/date-utils";
import { toZonedTime } from "date-fns-tz";
import { EditMealDialog } from "@/components/edit-meal-dialog";

export default async function DashboardPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    // Fetch db user
    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser) redirect("/onboarding");

    // Fetch metrics
    const weightHistory = await getWeightHistory();
    // history is DESC (newest first), so current is index 0
    const currentWeight = weightHistory.length > 0 ? weightHistory[0].weight : dbUser.startWeight;

    // Fetch meals for today to calculate calories
    const todayStr = getBrazilTodayStr();

    // Fetch Daily Metrics (Steps)
    const dailyMetric = await db.query.dailyMetrics.findFirst({
        where: and(
            eq(dailyMetrics.userId, dbUser.id),
            eq(dailyMetrics.date, todayStr)
        )
    });

    const todaysMeals = await db.query.meals.findMany({
        where: and(
            eq(meals.userId, dbUser.id),
        ),
        orderBy: (meals, { desc }) => [desc(meals.createdAt)],
        limit: 20,
    });

    const todaysWorkouts = await db.query.exercises.findMany({
        where: eq(exercises.userId, dbUser.id),
        orderBy: (exercises, { desc }) => [desc(exercises.startTime)],
        limit: 5,
    });

    // 1. Calculate Meal Score (Max 60)
    const todayInBrazil = toZonedTime(new Date(), 'America/Sao_Paulo');

    const todaysMealsFiltered = todaysMeals.filter(m => {
        const mealDate = toZonedTime(m.createdAt, 'America/Sao_Paulo');
        return mealDate.toDateString() === todayInBrazil.toDateString();
    });
    const todayCalories = todaysMealsFiltered.reduce((sum, m) => sum + (m.calories || 0), 0);

    let mealScore = 0;
    if (todaysMealsFiltered.length > 0) {
        const avgQuality = todaysMealsFiltered.reduce((sum, m) => sum + (m.qualityScore || 0), 0) / todaysMealsFiltered.length;
        mealScore = Math.min(60, avgQuality * 6); // 10 * 6 = 60 max
    }

    // 2. Calculate Consistency Score (Max 40)
    let consistencyScore = 0;

    // Weight Logged Today? (+20)
    const weightLoggedToday = weightHistory.some(w => new Date(w.date).toDateString() === todayStr); // This comparison might be loose but ok for now
    // Better: weightHistory date is YYYY-MM-DD string? In schema it's date.
    // If schema date is string YYYY-MM-DD, strict compare ok.

    // Let's check schema for weight history... it comes from dailyMetrics which has date field.
    // In getWeightHistory it returns { date: string, weight: number }
    if (weightHistory.some(w => w.date === todayStr)) consistencyScore += 20;

    // At least 3 meals logged? (+20)
    if (todaysMealsFiltered.length >= 3) consistencyScore += 20;

    // Total Score
    const score = Math.round(mealScore + consistencyScore);

    // Morning Brief Data
    const insightData = await getDailyInsight();
    const calorieGoal = dbUser.tmb || 2000;
    const caloriesRemaining = Math.max(0, calorieGoal - todayCalories);

    const workoutStatus = todaysWorkouts.length > 0 ? "done" : "planned"; // Simple logic for MVP


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                            VitalOS
                        </h1>
                        <p className="text-xs text-slate-500">Olá, {dbUser.name?.split(" ")[0]}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <SyncFitButton />
                        <UserButton
                            afterSignOutUrl="/sign-in"
                            userProfileMode="navigation"
                            userProfileUrl="/settings/profile"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-6">
                <div className="mb-4">
                    <MorningBrief
                        userName={dbUser.name || "Atleta"}
                        caloriesGoal={calorieGoal}
                        caloriesRemaining={caloriesRemaining}
                        workoutStatus={workoutStatus}
                        insight={insightData?.message || undefined}
                    />
                    <div className="mt-4">
                        <AutoSyncFit />
                    </div>
                </div>


                {/* Score */}
                <section>
                    <MetabolicScore
                        score={score}
                        steps={dailyMetric?.steps || 0}
                        stepsGoal={dbUser.stepGoal || 10000}
                        caloriesIn={todayCalories}
                        caloriesOut={dailyMetric?.caloriesBurned || 2000} // Default BMR if 0?
                    />
                </section>

                {/* Meals List */}
                <section>
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Refeições de Hoje</h2>
                    </div>
                    <div className="space-y-3">
                        {todaysMealsFiltered.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                <p className="text-sm">Nenhuma refeição registrada hoje.</p>
                            </div>
                        ) : (
                            todaysMealsFiltered.map((meal) => (
                                <Card key={meal.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                    <CardContent className="p-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                {meal.photoUrl && (
                                                    <div className="w-16 h-16 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                                                        <img src={meal.photoUrl} alt="Meal" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                            {meal.type === 'breakfast' ? 'Café' :
                                                                meal.type === 'lunch' ? 'Almoço' :
                                                                    meal.type === 'dinner' ? 'Jantar' : 'Lanche'}
                                                        </span>
                                                        <span className="text-xs text-slate-400">{new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1 line-clamp-2">
                                                        {meal.aiFeedback || "Refeição sem descrição"}
                                                    </p>
                                                    <div className="flex gap-3 mt-1.5 text-xs text-slate-500">
                                                        <span>🔥 {meal.calories} kcal</span>
                                                        <span>🥩 {meal.protein}g</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <EditMealDialog meal={meal} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </section>

                {/* Shortcuts */}
                <section className="grid grid-cols-1 gap-2 mb-3">
                    <Link href="/track/meal">
                        <Button className="w-full h-14 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg border-0 text-white flex items-center justify-center gap-2 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10" />
                            <Camera className="h-5 w-5 relative z-10" />
                            <span className="text-sm font-bold leading-tight relative z-10">Registrar Refeição</span>
                        </Button>
                    </Link>
                    <Link href="/workout">
                        <Button className="w-full h-14 bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg border-0 text-white flex items-center justify-center gap-2 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10" />
                            <Activity className="h-5 w-5 relative z-10" />
                            <span className="text-sm font-bold leading-tight relative z-10">Treinos</span>
                        </Button>
                    </Link>
                    <Link href="/activity">
                        <Button className="w-full h-14 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 flex flex-col items-center justify-center gap-0.5 p-1">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                            <span className="text-xs font-medium leading-tight">Histórico</span>
                        </Button>
                    </Link>
                </section>

                <section className="grid grid-cols-2 gap-3 mb-6">
                    <Link href="/track/weight">
                        <Button className="w-full h-14 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 flex flex-col items-center justify-center gap-0.5 p-1">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            <span className="text-xs font-medium leading-tight">Peso</span>
                        </Button>
                    </Link>
                    <Link href="/shopping">
                        <Button className="w-full h-14 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 flex flex-col items-center justify-center gap-0.5 p-1">
                            <ShoppingCart className="h-5 w-5 text-purple-600" />
                            <span className="text-xs font-medium leading-tight">Lista de Compras</span>
                        </Button>
                    </Link>
                    <Link href="/coach" className="col-span-2">
                        <Button className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-md hover:from-indigo-600 hover:to-purple-700 flex items-center justify-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            <span className="text-sm font-bold">Falar com Coach IA</span>
                        </Button>
                    </Link>
                </section>

                {/* Chart */}
                <section>
                    <WeightChart data={[...weightHistory].reverse()} />
                </section>
            </main>
        </div >
    );
}
