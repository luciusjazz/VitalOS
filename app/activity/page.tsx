"use client";

import { useState, useEffect } from "react";
import { ActivityCalendar } from "@/components/activity-calendar";
import { getDayExercises, getWeeklyStats } from "@/lib/actions/activity";
import { Card } from "@/components/ui/card";
import { Activity, Flame, Timer, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar"; // Assuming we have one, or reusable header
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function ActivityHubPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [exercises, setExercises] = useState<any[]>([]);
    const [stats, setStats] = useState({ minutes: 0, calories: 0, count: 0 });
    const [loading, setLoading] = useState(false);

    // Fetch Stats once
    useEffect(() => {
        getWeeklyStats().then(setStats);
    }, []);

    // Fetch Exercises on Date Change
    useEffect(() => {
        if (!date) return;
        setLoading(true);
        getDayExercises(date).then(data => {
            setExercises(data);
            setLoading(false);
        });
    }, [date]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Simple Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4 sticky top-0 z-10">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                    Histórico
                </h1>
            </div>

            <main className="max-w-md mx-auto p-4 space-y-6">

                {/* Weekly Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 border-orange-200 dark:border-orange-900">
                        <div className="flex items-center gap-2 mb-1">
                            <Timer className="w-4 h-4 text-orange-600" />
                            <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">Minutos (7d)</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.minutes}</span>
                    </Card>
                    <Card className="p-3 flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 border-red-200 dark:border-red-900">
                        <div className="flex items-center gap-2 mb-1">
                            <Flame className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-semibold text-red-700 dark:text-red-400">Calorias (7d)</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.calories}</span>
                    </Card>
                </div>

                {/* Calendar */}
                <ActivityCalendar selectedDate={date} onSelectDate={setDate} />

                {/* Daily List */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                        Treinos do Dia ({exercises.length})
                    </h2>

                    {loading ? (
                        <div className="text-center py-8 text-slate-400 animate-pulse">Carregando...</div>
                    ) : exercises.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p>Nenhum treino registrado.</p>
                            <Link href="/workout">
                                <Button variant="link" className="text-blue-500">Registrar agora</Button>
                            </Link>
                        </div>
                    ) : (
                        exercises.map((ex) => (
                            <Card key={ex.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                                    ex.source === 'live_tracking' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                                )}>
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100">{ex.type}</h3>
                                        <span className="text-xs font-medium text-slate-400">
                                            {new Date(ex.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Timer className="w-3 h-3" />
                                            {Math.round((new Date(ex.endTime).getTime() - new Date(ex.startTime).getTime()) / 60000)} min
                                        </span>
                                        {ex.calories > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Flame className="w-3 h-3" />
                                                {ex.calories} kcal
                                            </span>
                                        )}
                                        {ex.avgHr > 0 && (
                                            <span className="flex items-center gap-1 text-red-500 bg-red-50 px-1.5 py-0.5 rounded text-xs">
                                                ♥ {ex.avgHr}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

            </main>
        </div>
    );
}
