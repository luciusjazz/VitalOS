"use client";

import { Button } from "@/components/ui/button";
import { Bluetooth, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface PolarConnectProps {
    onHeartRateUpdate: (hr: number) => void;
    onRrIntervalUpdate?: (rr: number[]) => void;
    onStatusChange?: (status: "idle" | "connecting" | "connected" | "error") => void;
}

export function PolarConnect({ onHeartRateUpdate, onRrIntervalUpdate, onStatusChange }: PolarConnectProps) {
    const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
    const [device, setDevice] = useState<BluetoothDevice | null>(null);

    // Notify parent of status changes
    useEffect(() => {
        onStatusChange?.(status);
    }, [status, onStatusChange]);

    const connectToPolar = async () => {
        setStatus("connecting");
        try {
            // 1. Request Device
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }],
                optionalServices: ['battery_service']
            });

            setDevice(device);
            device.addEventListener('gattserverdisconnected', onDisconnected);

            // 2. Connect to GATT
            if (!device.gatt) throw new Error("GATT not available");

            // Wait for connection
            const server = await device.gatt.connect();

            // Double check connection
            if (!server.connected) {
                // Formatting retry loop would be better, but let's just wait a bit and try once more or fail
                await new Promise(r => setTimeout(r, 500));
                if (!server.connected) {
                    await server.connect(); // Retry once
                }
            }

            if (!server.connected) throw new Error("Falha ao estabilizar conexão GATT.");

            // 3. Get Service & Characteristic
            const service = await server.getPrimaryService('heart_rate');
            const characteristic = await service.getCharacteristic('heart_rate_measurement');

            // 4. Start Notifications
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', handleHeartRateChanged);

            setStatus("connected");
            toast.success("Polar H10 conectado!");

        } catch (error) {
            console.error("Bluetooth Error:", error);
            setStatus("error");
            toast.error("Erro ao conectar: " + (error instanceof Error ? error.message : "Desconhecido"));
            // Cleanup if partial connection
            if (device?.gatt?.connected) {
                device.gatt.disconnect();
            }
        }
    };

    const onDisconnected = () => {
        console.log('Device disconnected');
        setStatus("idle");
        toast.warning("Sensor desconectado.");
        // We do not auto-reconnect here to avoid loops, but we could add a "Reconnect" button.
    };

    const handleHeartRateChanged = (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        const value = target.value;
        if (!value) return;

        // Parse Heart Rate Measurement (0x2A37)
        // Flag byte: 
        // Bit 0: HR Format (0=UINT8, 1=UINT16)
        // Bit 4: RR Interval Present (0=No, 1=Yes)

        const flags = value.getUint8(0);
        const hrFormat = flags & 1; // 1 = uint16, 0 = uint8
        const rrPresent = (flags >> 4) & 1;

        let hrOffset = 1;
        let heartRate = 0;

        if (hrFormat === 1) {
            heartRate = value.getUint16(1, true); // Little Endian
            hrOffset = 3;
        } else {
            heartRate = value.getUint8(1);
            hrOffset = 2;
        }

        onHeartRateUpdate(heartRate);

        // Parse RR Intervals if present
        if (rrPresent === 1) {
            const rrIntervals = [];
            // Data may contain multiple RR intervals
            for (let i = hrOffset; i < value.byteLength; i += 2) {
                const rr = value.getUint16(i, true);
                // Resolution is 1/1024 seconds. Convert to ms if needed, but standard is keep raw or ms.
                // Usually represented in ms = (value / 1024) * 1000
                rrIntervals.push(Math.round((rr / 1024) * 1000));
            }
            if (onRrIntervalUpdate && rrIntervals.length > 0) {
                onRrIntervalUpdate(rrIntervals);
            }
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {status === "idle" && (
                <Button
                    onClick={connectToPolar}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg animate-pulse"
                >
                    <Bluetooth className="mr-2 h-5 w-5" />
                    Conectar Polar H10
                </Button>
            )}

            {status === "connecting" && (
                <Button disabled className="w-full bg-slate-200 text-slate-500">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Conectando...
                </Button>
            )}

            {status === "error" && (
                <Button onClick={connectToPolar} variant="destructive" className="w-full">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Tentar Novamente
                </Button>
            )}

            {status === "connected" && (
                <div className="flex items-center text-sm text-green-600 font-medium">
                    <Bluetooth className="w-4 h-4 mr-1" /> Conectado: {device?.name || "Polar Sensor"}
                </div>
            )}
        </div>
    );
}
