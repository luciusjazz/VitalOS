"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Camera, Upload, Type, Image as ImageIcon, Sparkles, RefreshCw } from "lucide-react";
import { useState, useRef } from "react";
import { analyzeFood, saveMeal } from "@/lib/actions/food-analysis";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function SnapFood() {
    const [mode, setMode] = useState<"photo" | "manual">("photo");
    const [preview, setPreview] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [manualText, setManualText] = useState("");
    const [refinementText, setRefinementText] = useState(""); // New state for AI correction

    // Separate refs for Camera and Gallery to handle Android intent correctly
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    // To store the final file to send (compressed)
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const router = useRouter();

    // Compression Utility
    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 1024;
                    const MAX_HEIGHT = 1024;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const newFile = new File([blob], file.name, {
                                type: "image/jpeg",
                                lastModified: Date.now(),
                            });
                            resolve(newFile);
                        } else {
                            reject(new Error("Compression failed"));
                        }
                    }, "image/jpeg", 0.7); // 70% Quality
                };
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Show immediate preview
                const reader = new FileReader();
                reader.onload = (e) => setPreview(e.target?.result as string);
                reader.readAsDataURL(file);

                // Compress in background
                const compressed = await compressImage(file);
                setSelectedFile(compressed);
            } catch (error) {
                console.error("Compression error:", error);
                // Fallback to original
                setSelectedFile(file);
            }
        }
    };

    const handleAnalyze = async (withRefinement = false) => {
        if (mode === "photo" && !selectedFile) return;
        if (mode === "manual" && !manualText.trim()) return;

        setAnalyzing(true);
        try {
            const formData = new FormData();

            if (mode === "photo" && selectedFile) {
                formData.append("image", selectedFile);
                // IF refining, add the text
                if (withRefinement && refinementText) {
                    formData.append("additionalPrompt", refinementText);
                }
            } else if (mode === "manual") {
                formData.append("text", manualText);
            }

            const data = await analyzeFood(formData);
            setResult(data);
            setRefinementText(""); // Clear refinement text after use
        } catch (error) {
            console.error(error);
            alert("Erro ao analisar. Tente novamente.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleConfirm = async () => {
        if (!result) return;
        setSaving(true);
        try {
            await saveMeal({
                ...result,
                photoUrl: selectedFile ? "stored-locally-for-mvp" : null, // We should ideally upload this
            });
            router.push("/dashboard");
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar refeição.");
        } finally {
            setSaving(false);
        }
    };

    const triggerCamera = () => cameraInputRef.current?.click();
    const triggerGallery = () => galleryInputRef.current?.click();

    if (result) {
        return (
            <Card className="border-none shadow-none bg-transparent animate-in fade-in slide-in-from-bottom-4">
                <CardContent className="space-y-4 text-center">
                    {/* Header Image or Icon */}
                    {preview ? (
                        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-2 border-2 border-green-100 shadow-sm">
                            <img src={preview} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-2">
                            <span className="text-3xl">🥗</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <input
                            type="text"
                            className="text-center w-full bg-transparent text-xl font-bold focus:outline-none border-b border-dashed border-slate-300 focus:border-blue-500 pb-1"
                            defaultValue={result.foodName || "Refeição"}
                            onChange={(e) => setResult({ ...result, foodName: e.target.value })}
                        />
                        <div className="flex justify-center items-end gap-1">
                            <input
                                type="number"
                                className="text-center w-24 bg-transparent text-3xl font-bold focus:outline-none border-b border-dashed border-slate-300 focus:border-blue-500"
                                defaultValue={result.calories}
                                onChange={(e) => setResult({ ...result, calories: Number(e.target.value) })}
                            />
                            <span className="text-sm font-medium text-slate-500 mb-2">kcal</span>
                        </div>

                        <div className="flex justify-center">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold",
                                result.qualityScore >= 8 ? "bg-green-100 text-green-700" :
                                    result.qualityScore >= 5 ? "bg-yellow-100 text-yellow-700" :
                                        "bg-red-100 text-red-700"
                            )}>
                                Nota: {result.qualityScore}/10
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm px-4 italic">"{result.feedback}"</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm px-2">
                        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                            <input
                                type="number"
                                className="text-center w-full bg-transparent font-bold text-blue-500 text-lg focus:outline-none"
                                defaultValue={result.protein}
                                onChange={(e) => setResult({ ...result, protein: Number(e.target.value) })}
                            />
                            <div className="text-xs text-slate-400">Proteína (g)</div>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                            <input
                                type="number"
                                className="text-center w-full bg-transparent font-bold text-yellow-500 text-lg focus:outline-none"
                                defaultValue={result.carbs}
                                onChange={(e) => setResult({ ...result, carbs: Number(e.target.value) })}
                            />
                            <div className="text-xs text-slate-400">Carbo (g)</div>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                            <input
                                type="number"
                                className="text-center w-full bg-transparent font-bold text-red-500 text-lg focus:outline-none"
                                defaultValue={result.fat}
                                onChange={(e) => setResult({ ...result, fat: Number(e.target.value) })}
                            />
                            <div className="text-xs text-slate-400">Gordura (g)</div>
                        </div>
                    </div>

                    {/* AI Refinement Input - Only visible in Photo Mode for now to correct the image analysis */}
                    {mode === "photo" && (
                        <div className="flex gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg items-center">
                            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                            <Input
                                placeholder="Ex: É low carb, é tapioca..."
                                className="h-8 text-xs bg-white dark:bg-slate-900 border-none shadow-sm"
                                value={refinementText}
                                onChange={(e) => setRefinementText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAnalyze(true)}
                            />
                            <Button size="icon" className="h-8 w-8 shrink-0" variant="ghost" onClick={() => handleAnalyze(true)} disabled={analyzing || !refinementText}>
                                {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                            </Button>
                        </div>
                    )}

                    <div className="pt-2 flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => { setResult(null); setPreview(null); setSelectedFile(null); }}>
                            Nova Foto
                        </Button>
                        <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleConfirm} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="flex flex-col space-y-6">
            {/* Mode Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button
                    onClick={() => setMode("photo")}
                    className={cn(
                        "flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
                        mode === "photo" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500"
                    )}
                >
                    <Camera className="w-4 h-4" /> Foto
                </button>
                <button
                    onClick={() => setMode("manual")}
                    className={cn(
                        "flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
                        mode === "manual" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500"
                    )}
                >
                    <Type className="w-4 h-4" /> Texto
                </button>
            </div>

            {/* Hidden Inputs */}
            <input
                type="file"
                accept="image/*"
                capture="environment" // Forces Camera on Mobile
                ref={cameraInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
            <input
                type="file"
                accept="image/*" // Allows Gallery
                ref={galleryInputRef}
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Photo Mode */}
            {mode === "photo" && (
                <div className="flex flex-col items-center space-y-4">
                    {preview ? (
                        <div className="relative w-64 h-64 rounded-xl overflow-hidden shadow-lg bg-slate-100">
                            <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute top-2 right-2 rounded-full h-8 w-8"
                                onClick={() => { setPreview(null); setSelectedFile(null); }}
                            >
                                X
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div
                                onClick={triggerCamera}
                                className="aspect-square border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors active:scale-95 duration-100"
                            >
                                <Camera className="w-10 h-10 text-blue-500 mb-2" />
                                <span className="text-slate-600 font-medium text-sm">Câmera</span>
                            </div>
                            <div
                                onClick={triggerGallery}
                                className="aspect-square border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors active:scale-95 duration-100"
                            >
                                <ImageIcon className="w-10 h-10 text-purple-500 mb-2" />
                                <span className="text-slate-600 font-medium text-sm">Galeria</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Manual Mode */}
            {mode === "manual" && (
                <div className="space-y-4">
                    <textarea
                        className="w-full h-40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 2 ovos cozidos, 1 fatia de pão integral e café preto..."
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                    />
                    <p className="text-xs text-slate-400 text-center">
                        Descreva os alimentos e quantidades para melhor precisão.
                    </p>
                </div>
            )}

            {/* Action Button */}
            <Button
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-500/20"
                onClick={() => handleAnalyze(false)}
                disabled={analyzing || (mode === "photo" && !selectedFile) || (mode === "manual" && !manualText.trim())}
            >
                {analyzing ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analisando...
                    </>
                ) : (
                    <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        {mode === "photo" ? "Analisar Foto" : "Analisar Texto"}
                    </>
                )}
            </Button>
        </div>
    );
}
