"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage } from "@/lib/actions/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Mic } from "lucide-react";

export function ChatInterface() {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([
        { role: "assistant", content: "Olá! Sou seu coach VitalOS. Como posso ajudar na sua dieta ou treino hoje?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null); // Use any to avoid type complexity with Web Speech API

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false; // Stop after one sentence/pause
                recognition.lang = "pt-BR";
                recognition.interimResults = false;

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInput((prev) => prev + (prev ? " " : "") + transcript);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognition.onerror = (event: any) => {
                    console.error("Speech error", event.error);
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Seu navegador não suporta reconhecimento de voz.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: "user", content: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const response = await sendMessage(newMessages);
            setMessages([...newMessages, { role: "assistant", content: response }]);
        } catch (error) {
            console.error(error);
            setMessages([...newMessages, { role: "assistant", content: "Desculpe, tive um erro. Tente novamente." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[80vh]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`flex gap-2 max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-blue-500" : "bg-green-500"}`}>
                                {m.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                            </div>
                            <div className={`p-3 rounded-2xl text-sm ${m.role === "user" ? "bg-blue-500 text-white rounded-tr-none" : "bg-slate-100 dark:bg-slate-800 rounded-tl-none"}`}>
                                {m.content}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none text-sm text-slate-500">
                            Digitando...
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t flex gap-2 items-center">
                <Button
                    type="button"
                    variant={isListening ? "destructive" : "secondary"}
                    size="icon"
                    className={`shrink-0 transition-all ${isListening ? "animate-pulse" : ""}`}
                    onClick={toggleListening}
                >
                    <Mic className="w-5 h-5" />
                </Button>

                <Input
                    placeholder={isListening ? "Ouvindo..." : "Pergunte algo..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={loading}
                    className="flex-1"
                />

                <Button onClick={handleSend} disabled={loading} size="icon" className="shrink-0 bg-blue-600 hover:bg-blue-700">
                    <Send className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
