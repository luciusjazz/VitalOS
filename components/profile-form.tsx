"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileData, profileSchema } from "@/lib/validations/onboarding";
import { updateUserProfile } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
    initialData: {
        name: string;
        height: number;
        targetWeight: number;
        dietaryPreferences: string;
        workoutDays: number;
        workoutPreferences: string;
        activityLevel: string;
        stepGoal?: number;
    }
}

// Revert to using ProfileData inferred from schema
export function ProfileForm({ initialData }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form: any = useForm<ProfileData>({
        // @ts-ignore - Resolver type mismatch despite correct schema
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: initialData.name || "",
            height: initialData.height || 170,
            targetWeight: initialData.targetWeight || 70,
            dietaryPreferences: initialData.dietaryPreferences || "",
            workoutDays: initialData.workoutDays || 3,
            workoutPreferences: initialData.workoutPreferences || "",
            // @ts-ignore
            activityLevel: initialData.activityLevel || "moderate",
            stepGoal: initialData.stepGoal || 10000,
        },
    });

    async function onSubmit(data: ProfileData) {
        setIsLoading(true);
        try {
            await updateUserProfile({
                name: data.name,
                height: data.height,
                targetWeight: data.targetWeight,
                dietaryPreferences: data.dietaryPreferences || "",
                workoutDays: data.workoutDays,
                workoutPreferences: data.workoutPreferences || "",
                activityLevel: data.activityLevel,
                stepGoal: data.stepGoal,
            });
            toast.success("Perfil atualizado com sucesso!");
            router.refresh();
        } catch (error) {
            toast.error("Erro ao atualizar perfil.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                                <Input placeholder="Seu nome" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Altura (cm)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="targetWeight"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Meta de Peso (kg)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="activityLevel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nível de Atividade</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="sedentary">Sedentário</SelectItem>
                                    <SelectItem value="light">Leve (1-3 dias)</SelectItem>
                                    <SelectItem value="moderate">Moderado (3-5 dias)</SelectItem>
                                    <SelectItem value="active">Ativo (6-7 dias)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="stepGoal"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Meta de Passos Diários</FormLabel>
                            <FormControl>
                                <Input type="number" step="100" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Preferências</h3>
                    <FormField
                        control={form.control}
                        name="dietaryPreferences"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preferências Alimentares</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Vegetariano, Sem glúten, Adoro massa..." {...field} />
                                </FormControl>
                                <FormDescription>O Coach usará isso para sugerir refeições.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="workoutDays"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dias de Treino/Semana</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" max="7" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="workoutPreferences"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Treino</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Musculação, Corrida, Casa" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                </Button>
            </form>
        </Form>
    );
}
