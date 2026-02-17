"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Cloud, Moon, Wind, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MorningBriefProps {
    userName: string;
    caloriesRemaining: number;
    caloriesGoal: number;
    workoutStatus: "planned" | "done" | "rest" | "none";
    insight?: string;
}

export function MorningBrief({ userName, caloriesRemaining, caloriesGoal, workoutStatus, insight }: MorningBriefProps) {
    const [greeting, setGreeting] = useState("");
    const [dateString, setDateString] = useState("");
    const [showBreathing, setShowBreathing] = useState(false);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Bom dia");
        else if (hour < 18) setGreeting("Boa tarde");
        else setGreeting("Boa noite");

        setDateString(new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));
    }, []);

    const getWorkoutMessage = () => {
        switch (workoutStatus) {
            case "done": return "Treino de hoje concluído! 💪";
            case "planned": return "Hoje tem treino! Bora? 🏃‍♂️";
            case "rest": return "Dia de descanso ativo. 🧘";
            default: return "Movimente-se hoje! 🚀";
        }
    };

    return (
        <>
            <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 text-white">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sun className="w-32 h-32" />
                </div>

                <div className="p-6 relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-medium capitalize">{dateString}</p>
                            <h1 className="text-2xl md:text-3xl font-bold mt-1">
                                {greeting}, {userName.split(' ')[0]}!
                            </h1>
                        </div>
                        <Button
                            variant="secondary/20"
                            size="sm"
                            className="bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm gap-2"
                            onClick={() => setShowBreathing(true)}
                        >
                            <Wind className="w-4 h-4" />
                            Respirar
                        </Button>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex flex-col justify-center">
                            <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Foco do Dia</span>
                            <p className="text-white font-medium mt-1">{getWorkoutMessage()}</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex flex-col justify-center">
                            <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Nutrição</span>
                            <div className="flex items-end gap-2 mt-1">
                                <span className="text-xl font-bold">{caloriesRemaining}</span>
                                <span className="text-sm text-blue-100 mb-1">kcal restantes</span>
                            </div>
                            <div className="w-full bg-white/20 h-1 rounded-full mt-2">
                                <div
                                    className="bg-white h-full rounded-full"
                                    style={{ width: `${Math.min(100, ((caloriesGoal - caloriesRemaining) / caloriesGoal) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {insight && (
                        <div className="mt-4 flex items-start gap-2 text-sm text-blue-100 bg-black/10 p-2 rounded-lg">
                            <span className="text-lg">💡</span>
                            <p className="italic">"{insight}"</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Breathing Modal */}
            <AnimatePresence>
                {showBreathing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <div className="absolute top-4 right-4">
                            <Button variant="ghost" size="icon" className="text-white rounded-full" onClick={() => setShowBreathing(false)}>
                                <X className="w-8 h-8" />
                            </Button>
                        </div>

                        <div className="flex flex-col items-center justify-center text-white space-y-8">
                            <h2 className="text-2xl font-light tracking-widest uppercase">Respire</h2>

                            <div className="relative flex items-center justify-center w-64 h-64">
                                <motion.div
                                    className="absolute inset-0 bg-blue-500/30 rounded-full blur-3xl"
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <motion.div
                                    className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.5)]"
                                    animate={{ scale: [1, 2, 1] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    {/* Center text could go here if needed, but clean is better */}
                                </motion.div>
                            </div>

                            <p className="text-lg font-medium text-blue-100 animate-pulse">
                                Inspire... Segure... Expire...
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
