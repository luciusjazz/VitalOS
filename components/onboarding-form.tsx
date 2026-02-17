"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OnboardingData, onboardingSchema } from "@/lib/validations/onboarding";
import { submitOnboarding } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function OnboardingForm() {
    const [step, setStep] = useState(1);
    const form = useForm<OnboardingData>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            gender: "male",
            activityLevel: "sedentary",
        },
    });

    async function onSubmit(data: OnboardingData) {
        await submitOnboarding(data);
    }

    const nextStep = async () => {
        const fieldsToValidate = step === 1
            ? ["gender", "age", "height"]
            : ["weight", "goalWeight", "activityLevel"];

        // @ts-ignore
        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) setStep(step + 1);
    };

    return (
        <Card className="w-full max-w-lg mx-auto mt-10 shadow-xl border-slate-200 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Vamos configurar seu VitalOS
                </CardTitle>
                <CardDescription className="text-center">
                    Passo {step} de 2: {step === 1 ? "Dados Pessoais" : "Metas & Atividade"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={form.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Gênero Biológico (Para cálculo TMB)</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex gap-4"
                                                    >
                                                        <FormItem className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-slate-50 w-full justify-center">
                                                            <FormControl>
                                                                <RadioGroupItem value="male" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer">Masculino</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-slate-50 w-full justify-center">
                                                            <FormControl>
                                                                <RadioGroupItem value="female" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer">Feminino</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="age"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Idade</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="30" type="number" {...field} value={field.value ?? ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="height"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Altura (cm)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="175" type="number" {...field} value={field.value ?? ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button type="button" className="w-full bg-slate-900" onClick={nextStep}>
                                        Próximo
                                    </Button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="weight"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Peso Atual (kg)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="80" type="number" step="0.1" {...field} value={field.value ?? ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="goalWeight"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Meta (kg)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="70" type="number" step="0.1" {...field} value={field.value ?? ""} />
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
                                                        <SelectItem value="sedentary">Sedentário (Pouco ou nenhum exercício)</SelectItem>
                                                        <SelectItem value="light">Leve (1-3 dias/semana)</SelectItem>
                                                        <SelectItem value="moderate">Moderado (3-5 dias/semana)</SelectItem>
                                                        <SelectItem value="active">Ativo (6-7 dias/semana)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex gap-3">
                                        <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>
                                            Voltar
                                        </Button>
                                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                            Finalizar Configuração
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
