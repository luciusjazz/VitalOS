"use client";

import { useState } from "react";
import { User } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Activity, Heart, Stethoscope, Ruler, ChevronRight, Check } from "lucide-react";
import { updateCardiacProfile } from "@/lib/actions/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CardiacProfileFormProps {
    user: User;
}

export function CardiacProfileForm({ user }: CardiacProfileFormProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [method, setMethod] = useState<"manual" | "cpet" | "ergometry" | "no_test">(
        (user.protocolMethod as any) || "no_test"
    );
    const [loading, setLoading] = useState(false);

    // Form State
    const [hrRest, setHrRest] = useState(user.restingHr || 60);
    const [hrPeak, setHrPeak] = useState(user.maxHr || 180);
    const [metPeak, setMetPeak] = useState(user.metPeak || 10);
    const [ft1, setFt1] = useState(user.ft1Bpm || 0);
    const [ft2, setFt2] = useState(user.ft2Bpm || 0);
    const [age, setAge] = useState(
        user.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : 30
    );

    // Calculated Preview
    const calculatePreview = () => {
        if (method === "no_test") {
            return {
                ft1: hrRest + 20,
                ft2: hrRest + 30,
                source: "Mytinger et al. (2020) - Guidelines"
            };
        }
        if (method === "ergometry") {
            const reserve = hrPeak - hrRest;
            const cFt1 = Math.round(3.453 + (0.887 * hrPeak) - (0.555 * reserve) + (1.044 * metPeak));
            const cFt2 = Math.round(-8.256 + (0.979 * hrPeak) - (0.232 * reserve) + (1.418 * metPeak));
            return {
                ft1: cFt1,
                ft2: cFt2,
                source: "Milani et al. (2023) - Equations"
            };
        }
        return { ft1, ft2, source: "Manual / CPET" };
    };

    const preview = calculatePreview();

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateCardiacProfile({
                protocolMethod: method,
                hrRest,
                hrPeak,
                metPeak,
                ft1Bpm: (method === "manual" || method === "cpet") ? ft1 : undefined,
                ft2Bpm: (method === "manual" || method === "cpet") ? ft2 : undefined,
                age
            });
            toast.success("Perfil Cardíaco atualizado com sucesso!");
            router.push("/settings/profile"); // Go back or stay? Maybe go back to profile.
        } catch (error) {
            toast.error("Erro ao salvar perfil.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stepper */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span className={step >= 1 ? "text-primary font-medium" : ""}>1. Método</span>
                <ChevronRight className="w-4 h-4" />
                <span className={step >= 2 ? "text-primary font-medium" : ""}>2. Dados</span>
                <ChevronRight className="w-4 h-4" />
                <span className={step >= 3 ? "text-primary font-medium" : ""}>3. Revisão</span>
            </div>

            {step === 1 && (
                <div className="grid gap-4 md:grid-cols-2">
                    <Card
                        className={`cursor-pointer border-2 transition-all ${method === "cpet" ? "border-primary bg-primary/5" : "border-transparent hover:border-slate-200"}`}
                        onClick={() => { setMethod("cpet"); setStep(2); }}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Stethoscope className="w-5 h-5 text-blue-500" />
                                Ergoespirometria
                            </CardTitle>
                            <CardDescription>Padrão Ouro (CPET)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            Tenho os limiares (VT1 e VT2) exatos do teste de gases.
                        </CardContent>
                    </Card>

                    <Card
                        className={`cursor-pointer border-2 transition-all ${method === "ergometry" ? "border-primary bg-primary/5" : "border-transparent hover:border-slate-200"}`}
                        onClick={() => { setMethod("ergometry"); setStep(2); }}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-green-500" />
                                Teste Ergométrico
                            </CardTitle>
                            <CardDescription>Padrão Prata (Esteira)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            Tenho FC Pico e METs, mas sem análise de gases. Usaremos equações clínicas.
                        </CardContent>
                    </Card>

                    <Card
                        className={`cursor-pointer border-2 transition-all ${method === "no_test" ? "border-primary bg-primary/5" : "border-transparent hover:border-slate-200"}`}
                        onClick={() => { setMethod("no_test"); setStep(2); }}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="w-5 h-5 text-red-500" />
                                Sem Teste (Estimado)
                            </CardTitle>
                            <CardDescription>Padrão Bronze (Diretrizes)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            Baseado apenas na Frequência de Repouso e Idade (RHR + 20-30 bpm).
                        </CardContent>
                    </Card>

                    <Card
                        className={`cursor-pointer border-2 transition-all ${method === "manual" ? "border-primary bg-primary/5" : "border-transparent hover:border-slate-200"}`}
                        onClick={() => { setMethod("manual"); setStep(2); }}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Ruler className="w-5 h-5 text-slate-500" />
                                Manual
                            </CardTitle>
                            <CardDescription>Personalizado</CardDescription>
                        </CardHeader>
                        <CardContent>
                            Quero definir meus próprios limites de treino.
                        </CardContent>
                    </Card>
                </div>
            )}

            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Insira seus Dados</CardTitle>
                        <CardDescription>
                            {method === "cpet" && "Informe os dados do seu laudo."}
                            {method === "ergometry" && "Dados do teste de esteira convencional."}
                            {method === "no_test" && "Seus dados básicos."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Frequência Cardíaca de Repouso (bpm)</Label>
                            <Input
                                type="number"
                                value={hrRest}
                                onChange={(e) => setHrRest(Number(e.target.value))}
                            />
                        </div>

                        {(method === "ergometry" || method === "cpet") && (
                            <div className="grid gap-2">
                                <Label>Frequência Cardíaca Máxima/Pico (bpm)</Label>
                                <Input
                                    type="number"
                                    value={hrPeak}
                                    onChange={(e) => setHrPeak(Number(e.target.value))}
                                />
                            </div>
                        )}

                        {method === "ergometry" && (
                            <div className="grid gap-2">
                                <Label>Capacidade Funcional (METs)</Label>
                                <Input
                                    type="number"
                                    value={metPeak}
                                    onChange={(e) => setMetPeak(Number(e.target.value))}
                                    step="0.1"
                                />
                            </div>
                        )}

                        {method === "no_test" && (
                            <div className="grid gap-2">
                                <Label>Idade</Label>
                                <Input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(Number(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">FC Máx estimada (220-idade): {220 - age} bpm</p>
                            </div>
                        )}

                        {(method === "cpet" || method === "manual") && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Limiar 1 (FT1)</Label>
                                    <Input
                                        type="number"
                                        value={ft1}
                                        onChange={(e) => setFt1(Number(e.target.value))}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Limiar 2 (FT2)</Label>
                                    <Input
                                        type="number"
                                        value={ft2}
                                        onChange={(e) => setFt2(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {step === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Sua Zona de Treino</CardTitle>
                        <CardDescription>Baseado no protocolo: {method.toUpperCase()}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-center items-center gap-4">
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground">Início (FT1)</div>
                                <div className="text-4xl font-bold text-green-500">{preview.ft1} <span className="text-sm text-foreground">bpm</span></div>
                            </div>
                            <div className="h-px flex-1 bg-border relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 opacity-20"></div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground">Fim (FT2)</div>
                                <div className="text-4xl font-bold text-orange-500">{preview.ft2} <span className="text-sm text-foreground">bpm</span></div>
                            </div>
                        </div>

                        <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg text-sm space-y-2">
                            <p><strong>Fonte do Cálculo:</strong> {preview.source}</p>
                            <p>Mantenha sua frequência cardíaca entre <strong>{preview.ft1} e {preview.ft2} bpm</strong> durante a fase de condicionamento.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-between">
                {step > 1 ? (
                    <Button variant="outline" onClick={() => setStep(step - 1)}>Voltar</Button>
                ) : (
                    <div></div>
                )}

                {step < 3 ? (
                    <Button onClick={() => setStep(step + 1)}>Próximo</Button>
                ) : (
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Salvando..." : "Confirmar e Salvar"}
                    </Button>
                )}
            </div>
        </div>
    );
}
