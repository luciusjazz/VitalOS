import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { meals, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EditMealDialog } from "@/components/edit-meal-dialog";

export default async function MealsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (!dbUser) redirect("/onboarding");

    // Fetch all meals, ordered by date desc
    const userMeals = await db.query.meals.findMany({
        where: eq(meals.userId, dbUser.id),
        orderBy: [desc(meals.createdAt)],
        limit: 50,
    });

    // Group meals by date
    const mealsByDate = userMeals.reduce((acc, meal) => {
        const date = meal.createdAt.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        if (!acc[date]) acc[date] = [];
        acc[date].push(meal);
        return acc;
    }, {} as Record<string, typeof userMeals>);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <header className="p-4 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-lg font-bold">Diário Alimentar</h1>
            </header>

            <main className="p-4 space-y-6">
                {Object.keys(mealsByDate).length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <p>Nenhuma refeição registrada.</p>
                        <Link href="/track/meal">
                            <Button className="mt-4" variant="outline">Registrar Agora</Button>
                        </Link>
                    </div>
                ) : (
                    Object.entries(mealsByDate).map(([date, meals]) => (
                        <div key={date} className="space-y-4">
                            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider sticky top-16 bg-slate-50 dark:bg-slate-950 py-2 z-0">
                                {date}
                            </h2>
                            <div className="space-y-3">
                                {meals.map((meal) => (
                                    <Card key={meal.id} className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900">
                                        <CardContent className="p-0 flex">
                                            {/* Photo */}
                                            <div className="w-24 h-24 bg-slate-200 shrink-0 relative group">
                                                {meal.photoUrl ? (
                                                    <img src={meal.photoUrl} alt="Meal" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                                                )}
                                                <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                                                    {meal.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-3 flex-1 flex flex-col justify-between">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium capitalize text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                                            {meal.type === 'breakfast' ? 'Café da Manhã' :
                                                                meal.type === 'lunch' ? 'Almoço' :
                                                                    meal.type === 'dinner' ? 'Jantar' : 'Lanche'}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                                            {meal.aiFeedback}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <div className="font-bold text-slate-900 dark:text-white">{meal.calories} kcal</div>
                                                        <div className="flex gap-1 mt-1">
                                                            <Badge variant={
                                                                (meal.qualityScore || 0) >= 8 ? "default" :
                                                                    (meal.qualityScore || 0) >= 5 ? "secondary" : "destructive"
                                                            } className="text-[10px] h-5 px-1.5">
                                                                {meal.qualityScore}
                                                            </Badge>
                                                            <EditMealDialog meal={meal} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Macros */}
                                                <div className="flex gap-3 text-[10px] text-slate-400 mt-2">
                                                    <span className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1" /> {meal.protein}g P</span>
                                                    <span className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1" /> {meal.carbs}g C</span>
                                                    <span className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" /> {meal.fat}g G</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </main>

            {/* Floating Action Button */}
            <Link href="/track/meal">
                <Button size="icon" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700">
                    <Plus className="h-6 w-6" />
                </Button>
            </Link>
        </div>
    );
}
