import { WeightLogForm } from "@/components/weight-log-form";
import { WeightHistoryList } from "@/components/weight-history-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWeightHistory } from "@/lib/actions/metrics";
import { WeightChart } from "@/components/weight-chart";

export default async function TrackWeightPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const history = await getWeightHistory();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
            <div className="mb-6 flex items-center">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold ml-2">Registrar Peso</h1>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm max-w-md mx-auto mb-6">
                <WeightLogForm />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm max-w-md mx-auto mb-6">
                <h2 className="text-lg font-bold mb-4">Evolução</h2>
                <WeightChart data={[...history].reverse()} />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm max-w-md mx-auto">
                <h2 className="text-lg font-bold mb-4">Histórico Recente</h2>
                <WeightHistoryList history={history} />
            </div>
        </div >
    );
}
