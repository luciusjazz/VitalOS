"use client";

import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Smile, Frown, Meh, Bike, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface RpeSliderProps {
    open: boolean;
    onSave: (rpe: number) => void;
    onCancel: () => void;
}

export function RpeSlider({ open, onSave, onCancel }: RpeSliderProps) {
    const [value, setValue] = useState([5]);

    const getRpeDescription = (val: number) => {
        if (val <= 2) return { text: "Muito Leve", color: "text-blue-400", icon: Smile };
        if (val <= 4) return { text: "Leve", color: "text-green-400", icon: Smile };
        if (val <= 6) return { text: "Moderado", color: "text-yellow-400", icon: Meh };
        if (val <= 8) return { text: "Difícil", color: "text-orange-500", icon: Frown };
        return { text: "Exaustivo", color: "text-red-500", icon: Bike };
    };

    const { text, color, icon: Icon } = getRpeDescription(value[0]);

    return (
        <Drawer open={open} onOpenChange={(o) => !o && onCancel()}>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle className="text-center">Como foi o esforço?</DrawerTitle>
                        <DrawerDescription className="text-center">Percepção Subjetiva de Esforço (PSE)</DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 pb-0 space-y-8">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className={cn("w-24 h-24 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-colors duration-300", color.replace('text-', 'bg-').replace('400', '100').replace('500', '100'))}>
                                <Icon className={cn("w-12 h-12 transition-colors duration-300", color)} />
                            </div>
                            <div className="text-center">
                                <span className={cn("text-4xl font-bold block", color)}>{value[0]}</span>
                                <span className="text-lg font-medium text-slate-600 dark:text-slate-300">{text}</span>
                            </div>
                        </div>

                        <Slider
                            value={value}
                            onValueChange={setValue}
                            max={10}
                            min={1}
                            step={1}
                            className="py-4"
                        />
                        <div className="flex justify-between text-xs text-slate-400 px-1">
                            <span>1 (Muito Leve)</span>
                            <span>10 (Exaustivo)</span>
                        </div>
                    </div>

                    <DrawerFooter>
                        <Button onClick={() => onSave(value[0])} className="w-full h-12 text-lg">
                            <Save className="w-5 h-5 mr-2" />
                            Salvar Treino
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
