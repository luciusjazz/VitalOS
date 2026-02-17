"use client";

import { useTransition } from "react";
import { updateAIModel } from "@/lib/actions/settings";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Sparkles, Zap, Brain, MessageSquare, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const MODELS = [
    {
        id: "google/gemini-2.0-flash-001",
        name: "Gemini 2.0 Flash",
        provider: "Google",
        type: "free",
        description: "Multimodal. O mais rápido e gratuito.",
        icon: Zap
    },
    {
        id: "meta-llama/llama-3.3-70b-instruct",
        name: "Llama 3.3 70B",
        provider: "Meta",
        type: "free",
        description: "Poderoso e open-source. Ótimo chat.",
        icon: Globe
    },

    {
        id: "qwen/qwen3-vl-235b-a22b-thinking",
        name: "Qwen 3 VL Thinking",
        provider: "Alibaba",
        type: "free",
        description: "Visão + Raciocínio (235B). Muito potente.",
        icon: Brain
    },
    {
        id: "z-ai/glm-4.5-air",
        name: "GLM 4.5 Air",
        provider: "Zhipu AI",
        type: "free",
        description: "Rápido e eficiente.",
        icon: Zap
    },
    {
        id: "deepseek/deepseek-r1",
        name: "DeepSeek R1",
        provider: "DeepSeek",
        type: "free",
        description: "Raciocínio avançado (CoT).",
        icon: Brain
    },
    {
        id: "qwen/qwen-2.5-72b-instruct",
        name: "Qwen 2.5 72B",
        provider: "Alibaba",
        type: "free",
        description: "Ótimo em conhecimento geral.",
        icon: Globe
    },
    {
        id: "thudm/glm-4-9b-chat",
        name: "GLM-4 9B",
        provider: "Zhipu",
        type: "free",
        description: "Econômico e eficiente.",
        icon: MessageSquare
    },
    {
        id: "z-ai/glm-5",
        name: "GLM-5",
        provider: "Zhipu AI",
        type: "free",
        description: "Novo flagship (Fev 2026). Inteligência de ponta.",
        icon: Sparkles
    },

    {
        id: "anthropic/claude-3.5-sonnet",
        name: "Claude 3.5 Sonnet",
        provider: "Anthropic",
        type: "paid",
        description: "Melhor texto e contexto.",
        icon: MessageSquare
    }
];

export function AIModelSelector({ initialModel }: { initialModel: string }) {
    const [isPending, startTransition] = useTransition();

    // Normalize initialModel
    const currentModelId =
        initialModel === "free" ? "google/gemini-2.0-flash-001" :
            initialModel === "paid" ? "openai/gpt-4o" :
                initialModel;

    const handleChange = (value: string) => {
        startTransition(async () => {
            // @ts-ignore
            await updateAIModel(value);
        });
    };

    return (
        <ScrollArea className="h-[400px] pr-4">
            <RadioGroup defaultValue={currentModelId} onValueChange={handleChange} disabled={isPending} className="space-y-3">
                {MODELS.map((model) => (
                    <div
                        key={model.id}
                        className={cn(
                            "flex items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-slate-50 cursor-pointer transition-all",
                            currentModelId === model.id ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500" : "border-slate-200"
                        )}
                        onClick={() => handleChange(model.id)}
                    >
                        <RadioGroupItem value={model.id} id={model.id} className="mt-1" />
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <Label htmlFor={model.id} className="font-bold cursor-pointer">
                                    {model.name}
                                </Label>
                                <div className="flex gap-2">
                                    <Badge
                                        variant={model.type === "free" ? "default" : "secondary"}
                                        className={cn(
                                            "text-[10px] h-5",
                                            model.type === "free" ? "bg-green-500 hover:bg-green-600" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                        )}
                                    >
                                        {model.type === "free" ? "GRÁTIS*" : "PAGO"}
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">
                                {model.description}
                            </p>
                            <p className="text-[10px] text-slate-400">
                                {model.provider}
                            </p>
                        </div>
                        {currentModelId === model.id && (
                            <Check className="h-4 w-4 text-blue-600" />
                        )}
                    </div>
                ))}
            </RadioGroup>
            <p className="text-xs text-slate-400 mt-4 px-1">
                * Modelos "Grátis" dependem da disponibilidade gratuita do OpenRouter e podem ter limites.
            </p>
        </ScrollArea>
    );
}
