import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, TrendingUp, Apple } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="px-6 py-4 flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold tracking-tight">VitalOS</span>
        </div>
        <Link href="/sign-in">
          <Button variant="ghost">Entrar</Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Seu Sistema Operacional de <span className="text-blue-600">Vida Saudável</span>.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Perca peso sem atrito. Use IA para analisar suas refeições e integre seus dados de saúde automaticamente.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 w-full sm:w-auto text-lg h-14 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20">
              Começar Agora <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full max-w-4xl">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Apple className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-bold mb-2">Nutrição IA</h3>
            <p className="text-sm text-slate-500">Tire fotos do seu prato e receba feedback instantâneo sobre qualidade e calorias.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-bold mb-2">Metabolic Score</h3>
            <p className="text-sm text-slate-500">Uma única pontuação diária que resume sua dieta, movimento e sono.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-bold mb-2">Anti-Fricção</h3>
            <p className="text-sm text-slate-500">Integração automática com seus dados de saúde. Foque no progresso, não no registro.</p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-slate-400">
        © 2026 VitalOS. Todos os direitos reservados.
      </footer>
    </div>
  );
}
