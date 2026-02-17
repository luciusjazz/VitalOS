"use client";

import { PolarConnect } from "@/components/polar-connect";
import { ClinicalZoneMeter } from "@/components/clinical-zone-meter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Timer, Flame, Activity, StopCircle } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logExercise } from "@/lib/actions/exercise";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { RpeSlider } from "@/components/rpe-slider";

export interface LiveWorkoutCockpitProps {
    maxHr: number;
    restingHr: number;
    weight: number;
    age: number;
    ft1?: number;
    ft2?: number;
}

export function LiveWorkoutCockpit({ maxHr = 180, restingHr = 60, weight = 70, age = 30, ft1, ft2 }: LiveWorkoutCockpitProps) {
    const router = useRouter();

    // Session State
    const [status, setStatus] = useState<"idle" | "running" | "paused">("idle");
    const [hr, setHr] = useState(0);
    const [duration, setDuration] = useState(0); // seconds
    const [calories, setCalories] = useState(0);
    const [zone, setZone] = useState(1);
    const [dataPoints, setDataPoints] = useState<{ time: Date, hr: number }[]>([]);

    // RPE State
    const [showRpe, setShowRpe] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate Zone & Safety
    useEffect(() => {
        if (hr === 0) return;

        let currentZone = 1;

        // Clinical Protocol Mode
        if (ft1 && ft2) {
            if (hr < ft1) currentZone = 1;
            else if (hr >= ft1 && hr <= ft2) currentZone = 2; // Target
            else currentZone = 3; // High
        } else {
            // Standard Percentage Mode
            const pct = hr / maxHr;
            if (pct >= 0.9) currentZone = 5;
            else if (pct >= 0.8) currentZone = 4;
            else if (pct >= 0.7) currentZone = 3;
            else if (pct >= 0.6) currentZone = 2;
        }

        setZone(currentZone);
    }, [hr, maxHr, ft1, ft2]);

    // Refs for accessing latest state inside interval/callbacks without re-triggering effect or stale closures
    const latestHrRef = useRef(hr);
    const latestWeightRef = useRef(weight);
    const latestAgeRef = useRef(age);
    const statusRef = useRef(status);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    useEffect(() => {
        latestHrRef.current = hr;
    }, [hr]);

    useEffect(() => {
        latestWeightRef.current = weight;
    }, [weight]);

    useEffect(() => {
        latestAgeRef.current = age;
    }, [age]);

    // Timer Logic
    useEffect(() => {
        if (status === "running") {
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);

                // Use Refs for logic
                const currentHr = latestHrRef.current;
                const currentWeight = latestWeightRef.current;
                const currentAge = latestAgeRef.current;

                // Calorie Burn Calc (Keytel formula estimate)
                if (currentHr > 80) {
                    const cPerMin = (-55.0969 + (0.6309 * currentHr) + (0.1988 * currentWeight) + (0.2017 * currentAge)) / 4.184;
                    setCalories(prev => prev + (Math.max(0, cPerMin) / 60));
                }
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [status]);


    const handleHrUpdate = (newHr: number) => {
        setHr(newHr);
        if (statusRef.current === "running") {
            setDataPoints(prev => [...prev, { time: new Date(), hr: newHr }]);
        }
    };

    const handleStart = () => setStatus("running");

    const handleStopClick = () => {
        setStatus("paused"); // Pause timer
        setShowRpe(true); // Open RPE Modal
    };

    const handleSaveWorkout = async (rpe: number) => {
        setShowRpe(false);
        setStatus("idle");

        if (dataPoints.length === 0) {
            toast.error("Nenhum dado de frequência cardíaca coletado.");
            return;
        }

        const toastId = toast.loading("Salvando treino...");

        try {
            // Calculate Stats
            const avgHr = Math.round(dataPoints.reduce((acc, curr) => acc + curr.hr, 0) / dataPoints.length);
            const sessionMaxHr = Math.max(...dataPoints.map(p => p.hr));

            // Save
            const startTime = dataPoints[0].time;
            const endTime = new Date(); // now

            const result = await logExercise({
                type: "Treino Livre (Ao Vivo)",
                source: "live_tracking",
                startTime,
                endTime,
                avgHr,
                maxHr: sessionMaxHr,
                calories: Math.round(calories),
                notes: `Zona Máxima Atingida: ${zone}`,
                rpe: rpe
            });

            if (result.success) {
                toast.success("Treino salvo com sucesso!", { id: toastId });
                router.refresh();
                router.push("/workout");
            } else {
                // @ts-ignore
                toast.error("Erro ao salvar treino: " + (result.error || "Erro desconhecido"), { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro crítico ao salvar treino.", { id: toastId });
        }
    };

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins}:${s.toString().padStart(2, '0')}`;
    };

    const [isSimulating, setIsSimulating] = useState(false);

    // Simulation Logic
    useEffect(() => {
        if (status === "running" && isSimulating) {
            const interval = setInterval(() => {
                // Determine HR based on a mock sine wave for demo
                const time = Date.now() / 1000;
                const baseHr = 100;
                const variation = 40; // +/- 40
                const fakeHr = Math.round(baseHr + Math.sin(time) * variation);
                handleHrUpdate(fakeHr);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [status, isSimulating]);

    // Background Color Logic
    const getBackgroundColor = () => {
        if (status !== "running") return "bg-slate-50 dark:bg-slate-950";

        // Clinical Zones
        if (ft1 && ft2) {
            if (zone === 1) return "bg-blue-50 dark:bg-blue-950"; // Warmup
            if (zone === 2) return "bg-emerald-50 dark:bg-emerald-950"; // Target
            if (zone === 3) return "bg-red-50 dark:bg-red-950"; // High
        }

        // Standard Zones
        if (zone <= 1) return "bg-slate-50 dark:bg-slate-950";
        if (zone === 2) return "bg-blue-50 dark:bg-blue-950/30";
        if (zone === 3) return "bg-green-50 dark:bg-green-950/30";
        if (zone === 4) return "bg-orange-50 dark:bg-orange-950/30";
        if (zone >= 5) return "bg-red-50 dark:bg-red-950/30";

        return "bg-slate-50 dark:bg-slate-950";
    };

    return (
        <motion.div
            className={cn("min-h-screen p-4 flex flex-col transition-colors duration-1000", getBackgroundColor())}
            animate={{
                backgroundColor: status === "running" ?
                    (zone >= 4 ? "#fef2f2" : zone === 3 ? "#f0fdf4" : zone === 2 ? "#eff6ff" : "#f8fafc")
                    : "#f8fafc" // Use hex for framer motion interpolation? No, classes are better for dark mode but motion handles colors well.
                // Let's stick to CSS classes via className for simplicity in dark mode, or use motion values if we want true smooth interpolation
            }}
        // Actually, simplest is just CSS transition on the div
        >
            <div className="mb-6 flex items-center relative z-10">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold ml-2">Monitoramento Ao Vivo</h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center space-y-8 pb-20 relative z-10">

                {/* Connection State */}
                {status === "idle" && dataPoints.length === 0 && (
                    <Card className="p-6 w-full max-w-sm bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
                        <h2 className="text-center font-semibold mb-4 text-lg">Conectar Sensor</h2>
                        <div className="flex justify-center mb-6">
                            <Activity className="w-16 h-16 text-blue-500 animate-pulse" />
                        </div>
                        <PolarConnect
                            onHeartRateUpdate={handleHrUpdate}
                            onStatusChange={(s) => {
                                if (s === "connected") handleStart();
                            }}
                        />
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-slate-400 hover:text-slate-600"
                                onClick={() => {
                                    setIsSimulating(true);
                                    handleStart();
                                    toast.info("Modo Simulação Ativado");
                                }}
                            >
                                Simular Sensor (Teste)
                            </Button>
                        </div>
                        <div className="mt-4 text-xs text-center text-slate-500">
                            FC Máxima Configurada: {maxHr} BPM
                            <div className="mt-1 font-mono text-[10px] text-slate-400">
                                Debug: {dataPoints.length} pontos coletados. (Status: {status})
                            </div>
                        </div>
                    </Card>
                )}

                {/* Live Cockpit */}
                {(status === "running" || status === "paused" || hr > 0) && (
                    <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500 flex flex-col items-center">

                        {/* Immersive Pulse Background Element */}
                        <motion.div
                            className={cn(
                                "fixed inset-0 pointer-events-none opacity-20",
                                zone >= 5 ? "bg-red-500" :
                                    zone === 4 ? "bg-orange-500" :
                                        zone === 3 ? "bg-green-500" :
                                            zone === 2 ? "bg-blue-500" : "bg-transparent"
                            )}
                            animate={{
                                opacity: [0.1, 0.2, 0.1],
                            }}
                            transition={{
                                duration: 2, // Pulse speed
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />

                        {/* Big HR */}
                        <div className="relative flex items-center justify-center py-10 scale-125">
                            <div className="relative z-10 flex flex-col items-center">
                                <span className={cn(
                                    "text-9xl font-black tracking-tighter tabular-nums drop-shadow-sm",
                                    zone >= 5 ? "text-red-600" :
                                        zone === 4 ? "text-orange-500" :
                                            zone === 3 ? "text-emerald-600" :
                                                zone === 2 ? "text-blue-600" :
                                                    "text-slate-900 dark:text-white"
                                )}>
                                    {hr}
                                </span>
                                <span className="text-2xl font-bold text-slate-400 mt-[-10px] uppercase tracking-widest">BPM</span>
                            </div>
                        </div>

                        {/* Zone Indicator & Meter */}
                        {ft1 && ft2 ? (
                            <div className="w-full bg-white/50 dark:bg-black/50 p-2 rounded-xl backdrop-blur-sm">
                                <ClinicalZoneMeter
                                    currentHr={hr}
                                    maxHr={maxHr}
                                    ft1={ft1}
                                    ft2={ft2}
                                    restingHr={restingHr}
                                />
                            </div>
                        ) : (
                            <Card className={cn(
                                "p-4 text-center border-2 transition-all duration-300 w-full shadow-lg bg-white/90 backdrop-blur-md dark:bg-slate-900/90",
                                cn(
                                    zone === 1 && "border-gray-300",
                                    zone === 2 && "border-blue-500",
                                    zone === 3 && "border-green-500",
                                    zone === 4 && "border-orange-500",
                                    zone === 5 && "border-red-600"
                                )
                            )}>
                                <div className="text-lg font-bold uppercase tracking-wider">
                                    {zone === 1 && "Aquecimento"}
                                    {zone === 2 && "Queima de Gordura"}
                                    {zone === 3 && "Aeróbico"}
                                    {zone === 4 && "Anaeróbico"}
                                    {zone === 5 && "Máximo!"}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 font-mono">
                                    ZONA {zone} ({Math.round((hr / maxHr) * 100)}%)
                                </div>
                            </Card>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <Card className="p-4 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm dark:bg-slate-900/90">
                                <Timer className="w-5 h-5 mb-2 text-slate-500" />
                                <span className="text-4xl font-mono tabular-nums tracking-tight">{formatTime(duration)}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Tempo</span>
                            </Card>
                            <Card className="p-4 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm dark:bg-slate-900/90">
                                <Flame className="w-5 h-5 mb-2 text-orange-500" />
                                <span className="text-4xl font-bold tabular-nums tracking-tight">{Math.round(calories)}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Kcal</span>
                            </Card>
                        </div>

                        {/* Controls */}
                        <Button
                            size="lg"
                            variant="destructive"
                            className="w-full h-16 text-xl rounded-2xl shadow-xl space-x-2 mt-4 active:scale-95 transition-transform bg-red-600 hover:bg-red-700"
                            onClick={handleStopClick}
                        >
                            <StopCircle className="w-8 h-8 fill-current" />
                            <span>Encerrar</span>
                        </Button>

                    </div>
                )}
            </div>

            <RpeSlider
                open={showRpe}
                onSave={handleSaveWorkout}
                onCancel={() => {
                    setShowRpe(false);
                    setStatus("running"); // Resume if cancelled
                }}
            />
        </motion.div>
    );
}
