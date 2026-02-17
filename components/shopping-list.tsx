"use client";

import { useState } from "react";
import { addItem, toggleItem, generateSmartList } from "@/lib/actions/shopping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Plus, Trash2 } from "lucide-react";

interface ShoppingListProps {
    items: any[];
}

export function ShoppingList({ items }: ShoppingListProps) {
    const [newItem, setNewItem] = useState("");

    const handleAdd = async () => {
        if (!newItem) return;
        await addItem(newItem);
        setNewItem("");
    };

    const handleToggle = async (id: string, checked: boolean) => {
        await toggleItem(id, checked);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <Input
                    placeholder="Adicionar item..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                <Button onClick={handleAdd}>
                    <Plus className="h-5 w-5" />
                </Button>
            </div>

            {items.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-slate-500 mb-4">Sua lista está vazia.</p>
                    <Button variant="outline" onClick={() => generateSmartList()} className="gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        Gerar Lista Metábolica
                    </Button>
                </div>
            )}

            <div className="space-y-2">
                {items.map((item) => (
                    <Card key={item.id} className={item.isChecked ? "opacity-50" : ""}>
                        <CardContent className="p-3 flex items-center gap-3">
                            <Checkbox
                                checked={item.isChecked}
                                onCheckedChange={(c) => handleToggle(item.id, c as boolean)}
                            />
                            <span className={item.isChecked ? "line-through" : ""}>{item.item}</span>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
