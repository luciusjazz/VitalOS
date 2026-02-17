"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ClinicalZoneMeterProps {
    currentHr: number;
    maxHr: number;
    ft1: number;
    ft2: number;
    restingHr?: number;
    className?: string;
}

export function ClinicalZoneMeter({ currentHr, maxHr, ft1, ft2, restingHr = 60, className }: ClinicalZoneMeterProps) {
    // Clamp values for safety
    const safeMax = Math.max(maxHr, ft2 + 20);
    const safeMin = Math.min(restingHr, ft1 - 10);
    const range = safeMax - safeMin;

    // Calculate percentages for segments
    // Start is safeMin (0% pos)
    // FT1 position
    const ft1Pos = Math.max(0, Math.min(100, ((ft1 - safeMin) / range) * 100));
    // FT2 position
    const ft2Pos = Math.max(0, Math.min(100, ((ft2 - safeMin) / range) * 100));

    // Current HR position
    const curPos = Math.max(0, Math.min(100, ((currentHr - safeMin) / range) * 100));

    // Zone Determination for Color
    let zoneColor = "text-slate-500";
    if (currentHr < ft1) zoneColor = "text-blue-500";
    else if (currentHr >= ft1 && currentHr <= ft2) zoneColor = "text-green-500";
    else zoneColor = "text-red-500";

    return (
        <div className={cn("w-full space-y-2", className)}>
            {/* Labels */}
            <div className="flex justify-between text-xs font-medium text-slate-400">
                <span>{safeMin}</span>
                <span className="text-blue-500 ml-8">FT1 ({ft1})</span>
                <span className="text-red-500 mr-8">FT2 ({ft2})</span>
                <span>{safeMax}</span>
            </div>

            {/* Bar Container */}
            <div className="relative h-6 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                {/* Zone 1: Warmup */}
                <div
                    className="h-full bg-blue-300 dark:bg-blue-900/40 border-r border-white/20"
                    style={{ width: `${ft1Pos}%` }}
                />
                {/* Zone 2: Therapeutic (Green) */}
                <div
                    className="h-full bg-green-400 dark:bg-green-600/60 border-r border-white/20"
                    style={{ width: `${ft2Pos - ft1Pos}%` }}
                />
                {/* Zone 3: Excessive (Red) */}
                <div
                    className="h-full bg-red-400 dark:bg-red-900/40"
                    style={{ width: `${100 - ft2Pos}%` }}
                />

                {/* Marker / Needle */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-all duration-500 ease-out z-10"
                    style={{ left: `${curPos}%`, transform: 'translateX(-50%)' }}
                >
                    <div className={cn("w-3 h-3 rounded-full -mt-1 -ml-1 border-2 border-white",
                        currentHr < ft1 ? "bg-blue-500" :
                            currentHr <= ft2 ? "bg-green-500" : "bg-red-500"
                    )} />
                </div>
            </div>

            {/* Current Status Text - Centered */}
            <div className={cn("text-center font-bold text-sm transition-colors", zoneColor)}>
                {currentHr < ft1 ? "AQUECIMENTO" :
                    currentHr <= ft2 ? "ZONA TERAPÊUTICA (ALVO)" : "ZONA EXCESSIVA"}
            </div>
        </div>
    );
}
