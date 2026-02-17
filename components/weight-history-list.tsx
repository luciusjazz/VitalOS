"use client";

import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteWeightLog } from "@/lib/actions/metrics";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface WeightHistoryListProps {
    history: {
        id: string;
        date: string;
        weight: number | null;
    }[];
}

export function WeightHistoryList({ history }: WeightHistoryListProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este registro?")) return;

        setDeletingId(id);
        try {
            await deleteWeightLog(id);
            toast.success("Registro excluído com sucesso!");
            router.refresh();
        } catch (error) {
            toast.error("Erro ao excluir registro.");
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    }

    if (history.length === 0) {
        return <div className="text-center text-slate-500 py-4">Nenhum registro encontrado.</div>;
    }

    return (
        <div className="space-y-2">
            {history.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {log.weight} kg
                        </div>
                        <div className="text-xs text-slate-500">
                            {format(parseISO(log.date), "dd 'de' MMMM", { locale: ptBR })}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8"
                        onClick={() => handleDelete(log.id)}
                        disabled={deletingId === log.id}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
    );
}
