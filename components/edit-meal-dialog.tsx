"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { updateMeal, deleteMeal } from "@/lib/actions/meals";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is installed, otherwise verify

interface EditMealDialogProps {
    meal: {
        id: string;
        aiFeedback: string | null;
        calories: number | null;
        protein: number | null;
        carbs: number | null;
        fat: number | null;
        type: string;
    };
}

export function EditMealDialog({ meal }: EditMealDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        description: meal.aiFeedback || "",
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        carbs: meal.carbs || 0,
        fat: meal.fat || 0,
        type: meal.type || "snack",
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateMeal(meal.id, formData);
            setOpen(false);
            toast.success("Refeição atualizada!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir esta refeição?")) return;
        setLoading(true);
        try {
            await deleteMeal(meal.id);
            setOpen(false);
            toast.success("Refeição excluída!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Refeição</DialogTitle>
                    <DialogDescription>
                        Corrija os valores nutricionais ou a descrição.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Descrição
                        </Label>
                        <Input
                            id="name"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Tipo
                        </Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="breakfast">Café da Manhã</SelectItem>
                                <SelectItem value="lunch">Almoço</SelectItem>
                                <SelectItem value="dinner">Jantar</SelectItem>
                                <SelectItem value="snack">Lanche</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cal" className="text-right">
                            Calorias (kcal)
                        </Label>
                        <Input
                            id="cal"
                            type="number"
                            value={formData.calories}
                            onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Proteína (g)</Label>
                            <Input
                                type="number"
                                value={formData.protein}
                                onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Carbo (g)</Label>
                            <Input
                                type="number"
                                value={formData.carbs}
                                onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Gordura (g)</Label>
                            <Input
                                type="number"
                                value={formData.fat}
                                onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex justify-between sm:justify-between items-center gap-2">
                    <Button variant="destructive" size="icon" onClick={handleDelete} disabled={loading}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
