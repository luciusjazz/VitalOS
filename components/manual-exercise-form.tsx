"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { logExercise } from "@/lib/actions/exercise";
import { CalendarIcon, Timer, Flame, Activity } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming sonner is used, if not I'll just rely on state or check utils

export function ManualExerciseForm() {
    const router = useRouter();
    const [date, setDate] = useState<Date>(new Date());
    const [time, setTime] = useState("08:00");
    const [type, setType] = useState("caminhada");
    const [duration, setDuration] = useState("");
    const [calories, setCalories] = useState("");
    const [avgHr, setAvgHr] = useState("");
    const [loading, setLoading] = useState(false);

    const exerciseTypes = [
        { value: "caminhada", label: "Caminhada" },
        { value: "corrida", label: "Corrida" },
        { value: "ciclismo", label: "Ciclismo" },
        { value: "musculacao", label: "Musculação" },
        { value: "natacao", label: "Natação" },
        { value: "yoga", label: "Yoga" },
        { value: "pilates", label: "Pilates" },
        { value: "outro", label: "Outro" },
    ];

    async function handleSubmit() {
        if (!type || !duration) return;
        setLoading(true);

        try {
            // Combine date and time
            const startDateTime = new Date(date);
            const [hours, minutes] = time.split(":").map(Number);
            startDateTime.setHours(hours, minutes, 0, 0);

            // Calculate endTime
            const durationMins = parseInt(duration);
            const endTime = new Date(startDateTime.getTime() + durationMins * 60000);

            const result = await logExercise({
                type,
                startTime: startDateTime,
                endTime: endTime,
                calories: calories ? parseInt(calories) : undefined,
                avgHr: avgHr ? parseInt(avgHr) : undefined,
                source: "manual",
                notes: "Registrado manualmente via app"
            });

            if (result && result.success) {
                // toast.success("Exercício registrado!");
                router.push("/workout");
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                    <Label>Data</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "P", { locale: ptBR }) : <span>Data</span>}
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
                <div className="flex flex-col space-y-2">
                    <Label>Hora</Label>
                    <Input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                </div>
            </div>

            {/* Type Selector */}
            <div className="space-y-2">
                <Label>Tipo de Atividade</Label>
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        {exerciseTypes.map(t => (
                            <SelectItem key={t.value} value={t.value}>
                                {t.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Duration */}
            <div className="flex flex-col space-y-2">
                <Label>Duração (minutos)</Label>
                <div className="relative">
                    <Timer className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                        type="number"
                        className="pl-9"
                        placeholder="Ex: 30"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    />
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                    <Label>Calorias (kcal)</Label>
                    <div className="relative">
                        <Flame className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                        <Input
                            type="number"
                            className="pl-9"
                            placeholder="Opcional"
                            value={calories}
                            onChange={(e) => setCalories(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-col space-y-2">
                    <Label>BPM Médio</Label>
                    <div className="relative">
                        <Activity className="absolute left-3 top-3 h-4 w-4 text-red-500" />
                        <Input
                            type="number"
                            className="pl-9"
                            placeholder="Opcional"
                            value={avgHr}
                            onChange={(e) => setAvgHr(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Button
                onClick={handleSubmit}
                disabled={loading || !duration}
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
            >
                {loading ? "Salvando..." : "Registrar Treino"}
            </Button>
        </div>
    );
}
