"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { logWeight } from "@/lib/actions/metrics";
import { Slider } from "@/components/ui/slider";
import { CalendarIcon, Frown, Meh, Smile, Zap } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function WeightLogForm() {
    const [weight, setWeight] = useState("");
    const [date, setDate] = useState<Date>(new Date());
    const [mood, setMood] = useState("neutral");
    const [energy, setEnergy] = useState([5]);

    const moods = [
        { value: "sad", icon: Frown, color: "text-blue-500" },
        { value: "neutral", icon: Meh, color: "text-slate-500" },
        { value: "happy", icon: Smile, color: "text-green-500" },
        { value: "energetic", icon: Zap, color: "text-yellow-500" },
    ];

    async function handleSubmit() {
        if (!weight) return;
        await logWeight({
            weight: parseFloat(weight),
            date: date,
            mood,
            energy: energy[0],
        });
    }

    return (
        <div className="space-y-6">
            {/* Date Picker */}
            <div className="flex justify-center">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: ptBR }) : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => d && setDate(d)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Weight Input */}
            <div className="flex flex-col items-center space-y-2">
                <Label className="text-lg">Peso (kg)</Label>
                <div className="relative w-32">
                    <Input
                        type="number"
                        step="0.1"
                        className="text-center text-3xl h-16"
                        placeholder="0.0"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                    />
                </div>
            </div>

            {/* Mood Selector */}
            <div className="space-y-3">
                <Label>Como você se sente?</Label>
                <div className="flex justify-between">
                    {moods.map((m) => (
                        <button
                            key={m.value}
                            onClick={() => setMood(m.value)}
                            className={`flex flex-col items-center p-3 rounded-lg border transition-all ${mood === m.value ? "bg-slate-100 dark:bg-slate-800 border-slate-400" : "border-transparent"}`}
                        >
                            <m.icon className={`h-8 w-8 ${m.color}`} />
                            <span className="text-xs mt-1 capitalize">{m.value}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Energy Slider */}
            <div className="space-y-4">
                <Label>Nível de Energia ({energy[0]}/10)</Label>
                <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={energy}
                    onValueChange={setEnergy}
                    className="cursor-pointer"
                />
            </div>

            <Button onClick={handleSubmit} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
                Salvar Registro
            </Button>
        </div>
    );
}
