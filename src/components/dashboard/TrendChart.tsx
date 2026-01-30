'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DataPoint {
    date: string;
    value: number;
}

interface TrendChartProps {
    data: DataPoint[];
    color?: string; // Hex color
    gradientId: string;
}

export const TrendChart: React.FC<TrendChartProps> = React.memo(({ data, color = "#10b981", gradientId }) => {

    // Clean Code: Calculate min/max for better Y-Axis scaling
    const { min, max } = useMemo(() => {
        if (data.length === 0) return { min: 0, max: 100 };
        const values = data.map(d => d.value);
        return {
            min: Math.min(...values),
            max: Math.max(...values)
        };
    }, [data]);

    // Dynamic padding for Y-Axis
    const domain = [min - (Math.abs(min) * 0.1), max + (Math.abs(max) * 0.1)];

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        hide={false}
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        domain={domain}
                        width={40}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.9)',
                            borderColor: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '12px',
                            padding: '12px',
                            color: '#fff',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                        }}
                        itemStyle={{ color: color, fontWeight: 600 }}
                        labelStyle={{ color: '#9ca3af', marginBottom: '0.25rem', fontSize: '0.8rem' }}
                        formatter={(value: any) => [`€${Number(value).toFixed(2)}`, 'Bankroll']}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill={`url(#${gradientId})`}
                        animationDuration={1500}
                        dot={{ r: 4, strokeWidth: 2, fill: '#0a0a0f', stroke: color }}
                        activeDot={{ r: 6, strokeWidth: 0, fill: color }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
});

TrendChart.displayName = 'TrendChart';
