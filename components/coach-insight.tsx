"use client";

import { useEffect, useState } from "react";
import { getDailyInsight } from "@/lib/actions/coach";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Quote, Trophy, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Insight {
    id: string;
    message: string;
    type: string;
}

export function CoachInsight() {
    const [insight, setInsight] = useState<Insight | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                // @ts-ignore
                const data = await getDailyInsight();
                if (data) setInsight(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return null; // Or a skeleton
    if (!insight) return null;

    const getIcon = () => {
        switch (insight.type) {
            case "celebration": return <Trophy className="h-5 w-5 text-yellow-500" />;
            case "warning": return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case "welcome": return <Quote className="h-5 w-5 text-blue-500" />;
            default: return <Lightbulb className="h-5 w-5 text-amber-500" />;
        }
    };

    const getBgColor = () => {
        switch (insight.type) {
            case "celebration": return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900";
            case "warning": return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900";
            case "welcome": return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900";
            default: return "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900";
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
            >
                <Card className={`border ${getBgColor()}`}>
                    <CardContent className="p-4 flex gap-3 items-start">
                        <div className="mt-1 flex-shrink-0">
                            {getIcon()}
                        </div>
                        <div>
                            <p className="text-sm font-medium italic text-muted-foreground mb-1">Coach Vital diz:</p>
                            <p className="text-sm font-semibold text-foreground leading-relaxed">
                                "{insight.message}"
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}
