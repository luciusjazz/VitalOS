import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Smartphone } from "lucide-react";
import Link from "next/link";

export default function HealthSyncPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
            <div className="mb-6 flex items-center">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold ml-2">Sincronização (Anti-Fricção)</h1>
            </div>

            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-6 w-6 text-blue-500" />
                        iOS Shortcuts
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Para sincronizar seus Passos e Sono automaticamente do Apple Health, crie um Atalho no iOS que chame nossa API:
                    </p>
                    <div className="bg-slate-100 p-3 rounded-md text-xs font-mono break-all">
                        POST https://vitalos.app/api/health/sync
                        <br />
                        Body: {"{"} "email": "seu@email.com", "steps": 5000, "sleep": 7.5 {"}"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        *Nota: Esta é uma solução MVP. Em breve teremos integração nativa.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
