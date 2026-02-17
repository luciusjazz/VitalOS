
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Heart, Activity, User, Save, Loader2 } from "lucide-react";
import { updateProfile } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SettingsForm({ user }: { user: any }) {
    const [loading, setLoading] = useState(false);

    // Safety: ensure default values
    const [formData, setFormData] = useState({
        name: user.name || "",
        height: user.height || "",
        startWeight: user.startWeight || "",
        targetWeight: user.targetWeight || "",
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
        maxHr: user.maxHr || "",
        restingHr: user.restingHr || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateMaxHr = () => {
        if (!formData.birthDate) {
            toast.error("Preencha a data de nascimento primeiro.");
            return;
        }
        const birthYear = new Date(formData.birthDate).getFullYear();
        const age = new Date().getFullYear() - birthYear;
        const estimatedMax = 220 - age;
        setFormData(prev => ({ ...prev, maxHr: estimatedMax.toString() }));
        toast.info("FC Máx estimada: " + estimatedMax + " bpm (220 - idade)");
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(formData);
            toast.success("Perfil atualizado com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar perfil.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-blue-500" />
                    Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                        <Input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="height">Altura (cm)</Label>
                        <Input type="number" id="height" name="height" value={formData.height} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="startWeight">Peso Atual (kg)</Label>
                        <Input type="number" id="startWeight" name="startWeight" step="0.1" value={formData.startWeight} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full pointer-events-none" />
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
                    <Heart className="w-5 h-5" />
                    Saúde Cardíaca (Zonas de Treino)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="maxHr">Frequência Cardíaca Máxima</Label>
                            <Button type="button" variant="ghost" size="xs" onClick={calculateMaxHr} className="text-xs text-blue-500 h-auto p-0 hover:bg-transparent">
                                Calcular (220 - idade)
                            </Button>
                        </div>
                        <Input
                            type="number"
                            id="maxHr"
                            name="maxHr"
                            value={formData.maxHr}
                            onChange={handleChange}
                            placeholder="Ex: 180"
                            className="border-red-200 focus:ring-red-500"
                        />
                        <p className="text-xs text-slate-500">Usado para definir as zonas de perigo.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="restingHr">FC de Repouso (Média)</Label>
                        <Input
                            type="number"
                            id="restingHr"
                            name="restingHr"
                            value={formData.restingHr}
                            onChange={handleChange}
                            placeholder="Ex: 60"
                        />
                        <p className="text-xs text-slate-500">Usado para calcular a Reserva de FC (Karvonen).</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Configurações Clínicas</h3>
                <Link href="/settings/cardiac-profile" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2" type="button">
                        <Activity className="w-4 h-4 text-red-500" />
                        Configurar Zonas e Protocolos (FT1/FT2)
                    </Button>
                </Link>
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? <Activity className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Configurações
            </Button>
        </form>
    );
}
