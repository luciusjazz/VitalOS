"use client";

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import "react-day-picker/style.css";
import { Card } from "@/components/ui/card";
import { getMonthExercises } from "@/lib/actions/activity";
import { cn } from "@/lib/utils";

interface ActivityCalendarProps {
    selectedDate: Date | undefined;
    onSelectDate: (date: Date | undefined) => void;
}

export function ActivityCalendar({ selectedDate, onSelectDate }: ActivityCalendarProps) {
    const [month, setMonth] = useState<Date>(new Date());
    const [workoutDays, setWorkoutDays] = useState<Date[]>([]);

    useEffect(() => {
        async function fetchMonthData() {
            const data = await getMonthExercises(month);
            // Extract unique dates with workouts
            const days = data.map(d => new Date(d.startTime));
            setWorkoutDays(days);
        }
        fetchMonthData();
    }, [month]);

    const modifiers = {
        hasWorkout: workoutDays
    };

    const modifiersStyles = {
        hasWorkout: {
            fontWeight: 'bold',
            color: 'var(--blue-500)',
            position: 'relative',
        }
    };

    const modifiersClassNames = {
        hasWorkout: "has-workout-day"
    };

    return (
        <Card className="p-4 flex justify-center border-none shadow-sm bg-white dark:bg-slate-900">
            <style>{`
                .has-workout-day {
                    position: relative;
                }
                .has-workout-day::after {
                    content: '';
                    position: absolute;
                    bottom: 2px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: #3b82f6; /* blue-500 */
                }
                .rdp-day_selected { 
                    background-color: #3b82f6 !important; 
                    color: white !important;
                }
                .rdp {
                    --rdp-cell-size: 40px;
                    margin: 0;
                }
            `}</style>
            <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={onSelectDate}
                locale={ptBR}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                onMonthChange={setMonth}
                footer={
                    selectedDate ? (
                        <p className="mt-4 text-center text-sm text-slate-500">
                            {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    ) : (
                        <p className="mt-4 text-center text-sm text-slate-500">Selecione um dia.</p>
                    )
                }
            />
        </Card>
    );
}
