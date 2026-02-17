import { ResetAccountButton } from "@/components/reset-account-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DangerPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
            <div className="mb-6 flex items-center">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold ml-2">Zona de Perigo</h1>
            </div>

            <div className="max-w-md mx-auto space-y-6">
                <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                            Resetar Conta
                        </CardTitle>
                        <CardDescription className="text-red-700/80 dark:text-red-300/80">
                            Apagar todos os dados de progresso e começar do zero.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Isso apagará:
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Histórico de refeições</li>
                                <li>Histórico de peso e medidas</li>
                                <li>Registros de exercícios</li>
                                <li>Itens da cozinha/lista de compras</li>
                            </ul>
                        </p>
                        <ResetAccountButton />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
