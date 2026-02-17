import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Zap, DollarSign } from "lucide-react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAIModel, updateAIModel } from "@/lib/actions/settings";
import { AIModelSelector } from "@/components/ai-model-selector";

export default async function AIConfigPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const currentModel = await getAIModel();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
            <div className="mb-6 flex items-center">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold ml-2">Inteligência Artificial</h1>
            </div>

            <div className="max-w-md mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                            Modelo do Cérebro
                        </CardTitle>
                        <CardDescription>
                            Escolha qual modelo de IA vai analisar suas fotos e conversar com você.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AIModelSelector initialModel={currentModel} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
