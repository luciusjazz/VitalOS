"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { syncGoogleFit } from "@/lib/actions/fitness";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function GoogleFitSyncCard() {
    const [loading, setLoading] = useState(false);
    const [lastResult, setLastResult] = useState<{ success: boolean; msg?: string } | null>(null);
    const router = useRouter();

    const handleSync = async () => {
        setLoading(true);
        try {
            const result = await syncGoogleFit();
            if (result.success) {
                const msg = `Sincronizado: ${result.steps} passos. ${result.sessionsCount > 0 ? `+${result.sessionsCount} treinos.` : "Nenhum treino novo."}`;
                toast.success(msg);
                setLastResult({ success: true, msg });
                router.refresh();
            } else {
                toast.error("Erro na sincronização: " + result.error);
                setLastResult({ success: false, msg: result.error });
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro desconhecido ao sincronizar.");
            setLastResult({ success: false, msg: "Erro de conexão." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-full",
                        lastResult?.success === false ? "bg-red-100 text-red-600" : "bg-green-100 dark:bg-green-900/30 text-green-600"
                    )}>
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            Google Fit
                            {lastResult?.success && <span className="text-[10px] font-normal text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">Atualizado</span>}
                        </h3>
                        <p className="text-xs text-slate-500">
                            {loading ? "Sincronizando..." : lastResult?.msg || "Sincronização de passos e atividades"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSync}
                        disabled={loading}
                        className="gap-2"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                        {loading ? "..." : "Sincronizar"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
