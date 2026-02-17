"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Check, RefreshCw, ShoppingCart, Package } from "lucide-react";
import { addKitchenItem, toggleItemStatus, deleteKitchenItem } from "@/lib/actions/kitchen";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type KitchenItem = {
    id: string;
    name: string;
    category: string | null;
    status: string;
};

export function ShoppingListClient({ initialItems }: { initialItems: KitchenItem[] }) {
    const [newItem, setNewItem] = useState("");
    const [activeTab, setActiveTab] = useState("shopping");

    const shoppingList = initialItems.filter(i => i.status === "shopping_list");
    const pantryList = initialItems.filter(i => i.status === "pantry");

    async function handleAdd() {
        if (!newItem.trim()) return;
        const result = await addKitchenItem(newItem, "Outros", activeTab === "shopping" ? "shopping_list" : "pantry");
        if (result.success) {
            setNewItem("");
            toast.success("Item adicionado!");
        } else {
            toast.error("Erro ao adicionar item");
        }
    }

    async function handleToggle(id: string, currentStatus: string) {
        const result = await toggleItemStatus(id, currentStatus);
        if (result.success) {
            if (currentStatus === "shopping_list") toast.success("Movido para Despensa! 🏠");
            else toast.success("Movido para Lista de Compras! 🛒");
        }
    }

    async function handleDelete(id: string) {
        const result = await deleteKitchenItem(id);
        if (result.success) toast.success("Item removido");
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder={activeTab === "shopping" ? "Adicionar à lista..." : "Adicionar à despensa..."}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                <Button onClick={handleAdd} size="icon" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-5 w-5" />
                </Button>
            </div>

            <Tabs defaultValue="shopping" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="shopping" className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" /> Comprar ({shoppingList.length})
                    </TabsTrigger>
                    <TabsTrigger value="pantry" className="flex items-center gap-2">
                        <Package className="h-4 w-4" /> Despensa ({pantryList.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="shopping" className="space-y-2">
                    {shoppingList.length === 0 && (
                        <div className="text-center p-8 text-slate-500">
                            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>Lista vazia! Tudo em dia.</p>
                        </div>
                    )}
                    {shoppingList.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-2">
                            <span className="font-medium">{item.name}</span>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button size="sm" onClick={() => handleToggle(item.id, item.status)} className="bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 shadow-sm">
                                    <Check className="h-4 w-4 mr-1" /> Comprado
                                </Button>
                            </div>
                        </div>
                    ))}
                </TabsContent>

                <TabsContent value="pantry" className="space-y-2">
                    {pantryList.length === 0 && (
                        <div className="text-center p-8 text-slate-500">
                            <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>Despensa vazia.</p>
                        </div>
                    )}
                    {pantryList.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleToggle(item.id, item.status)} className="text-orange-600 border-orange-200 hover:bg-orange-50">
                                    <RefreshCw className="h-4 w-4 mr-1" /> Acabou
                                </Button>
                            </div>
                        </div>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}
