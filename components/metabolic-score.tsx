"use client";

import { motion } from "framer-motion";

interface MetabolicScoreProps {
    score: number;
    steps: number;
    stepsGoal?: number; // default 10000
    caloriesIn: number;
    caloriesOut: number;
}

export function MetabolicScore({ score, steps, stepsGoal = 10000, caloriesIn, caloriesOut }: MetabolicScoreProps) {
    // Metabolic Score Color
    let scoreColor = "text-red-500";
    if (score >= 50) scoreColor = "text-yellow-500";
    if (score >= 80) scoreColor = "text-emerald-500";

    // Steps Progress
    const stepsProgress = Math.min(steps / stepsGoal, 1);
    const stepsCircumference = 2 * Math.PI * 88; // r=88

    // Metabolic Score Progress (Inner Ring?) - seeking simple design from user image
    // User image has a segmented ring. Let's keep it simple: 
    // Outer Ring = Steps
    // Inner Text = Score

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Background Ring (Steps) */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="128"
                        cy="128"
                        r="110" // Larger outer ring
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-100 dark:text-slate-800"
                    />
                    {/* Steps Progress Ring */}
                    <motion.circle
                        cx="128"
                        cy="128"
                        r="110"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-blue-500"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: stepsCircumference }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 110 * (1 - stepsProgress) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeDasharray={2 * Math.PI * 110}
                    />

                    {/* Inner Ring (Score) Background */}
                    <circle
                        cx="128"
                        cy="128"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-100 dark:text-slate-800" // Opacity handled by text color?
                        style={{ opacity: 0.3 }}
                    />

                    {/* Score Progress Ring */}
                    <motion.circle
                        cx="128"
                        cy="128"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className={scoreColor}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - (score / 100)) }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }} // slight delay
                        strokeDasharray={2 * Math.PI * 88}
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute flex flex-col items-center">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Score</span>
                    <span className={`text-6xl font-black ${scoreColor} tracking-tighter`}>{score}</span>
                    <div className="flex flex-col items-center mt-2">
                        <span className="text-sm font-bold text-blue-500">{steps.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">passos</span>
                    </div>
                </div>
            </div>

            {/* Stats Footer */}
            <div className="grid grid-cols-2 gap-8 mt-4 w-full max-w-xs">
                <div className="text-center">
                    <div className="text-sm text-slate-500 flex items-center justify-center gap-1">
                        🔥 Gastas
                    </div>
                    <div className="text-xl font-bold text-slate-700 dark:text-slate-200">
                        {caloriesOut} <span className="text-xs font-normal text-slate-400">kcal</span>
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-slate-500 flex items-center justify-center gap-1">
                        🍎 Ingeridas
                    </div>
                    <div className="text-xl font-bold text-slate-700 dark:text-slate-200">
                        {caloriesIn} <span className="text-xs font-normal text-slate-400">kcal</span>
                    </div>
                </div>
            </div>

            {/* Balance Bar */}
            <div className="w-full max-w-xs h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden flex">
                <div
                    className="h-full bg-orange-400"
                    style={{ width: `${Math.min((caloriesIn / (caloriesOut || 2000)) * 100, 100)}%` }} // Simple ratio
                />
            </div>
            <div className="flex justify-between w-full max-w-xs text-[10px] text-slate-400 mt-1">
                <span>Balanço Calórico</span>
                <span>{caloriesIn - caloriesOut > 0 ? `+${caloriesIn - caloriesOut}` : caloriesIn - caloriesOut} kcal</span>
            </div>
        </div>
    );
}
