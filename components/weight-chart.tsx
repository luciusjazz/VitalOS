"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeightChartProps {
    data: { date: string; weight: number | null }[];
}

export function WeightChart({ data }: WeightChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="flex items-center justify-center h-48 text-slate-400">
                    Registre seu peso para ver a evolução.
                </CardContent>
            </Card>
        );
    }

    // Calculate min/max for Y axis domain
    // Calculate min/max for Y axis domain
    const weights = data.map(d => d.weight).filter(w => w !== null && w !== undefined) as number[];

    if (weights.length === 0) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="flex items-center justify-center h-48 text-slate-400">
                    Registre seu peso para ver a evolução.
                </CardContent>
            </Card>
        );
    }

    const minWeight = Math.min(...weights) - 2;
    const maxWeight = Math.max(...weights) + 2;

    const formattedData = data
        .filter(d => d.weight !== null && d.weight !== undefined)
        .map(d => ({
            ...d,
            formattedDate: format(parseISO(d.date), "dd/MM")
        }));

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg">Evolução</CardTitle>
            </CardHeader>
            <CardContent className="px-0 h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedData}>
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="formattedDate"
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            domain={[minWeight, maxWeight]}
                            hide={true}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="weight"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorWeight)"
                            dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
