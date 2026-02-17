"use client";

import { Button } from "@/components/ui/button";
import { Activity, RefreshCw, Loader2 } from "lucide-react";
import { syncGoogleFit } from "@/lib/actions/fitness";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming sonner or similar, or just alert for MVP

export function SyncFitButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        setLoading(true);
        try {
            // @ts-ignore
            const result = await syncGoogleFit();
            if (result.success) {
                // @ts-ignore
                const sessionMsg = result.sessionsCount ? ` + ${result.sessionsCount} treinos` : "";

                alert(`Sincronizado!\nPassos: ${result.steps}${sessionMsg}`);
                router.refresh();
            } else {
                alert(`Erro: ${result.error || "Falha na sincronização"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com Google Fit.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={loading}
            className="gap-2"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sync Fit
        </Button>
    );
}
