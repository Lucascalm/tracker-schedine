import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string;
    subValue?: string;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: 'primary' | 'danger' | 'accent' | 'warning';
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    subValue,
    icon: Icon,
    trend,
    trendValue,
    color = 'accent'
}) => {
    const getColor = () => {
        switch (color) {
            case 'primary': return 'text-primary';
            case 'danger': return 'text-danger';
            case 'warning': return 'text-yellow-400';
            default: return 'text-indigo-400';
        }
    };

    const getBgColor = () => {
        switch (color) {
            case 'primary': return 'bg-emerald-500/10 border-emerald-500/20';
            case 'danger': return 'bg-rose-500/10 border-rose-500/20';
            case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
            default: return 'bg-indigo-500/10 border-indigo-500/20';
        }
    };

    return (
        <div className="glass-card p-6 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{label}</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${getBgColor()} transition-colors`}>
                    <Icon className={`w-6 h-6 ${getColor()}`} />
                </div>
            </div>

            {(subValue || trendValue) && (
                <div className="flex items-center gap-2 mt-2">
                    {trendValue && (
                        <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${trend === 'up' ? 'text-primary bg-primary/10' :
                                trend === 'down' ? 'text-danger bg-danger/10' : 'text-gray-400 bg-gray-500/10'
                            }`}>
                            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '•'} {trendValue}
                        </span>
                    )}
                    {subValue && (
                        <span className="text-sm text-gray-500 font-medium">
                            {subValue}
                        </span>
                    )}
                </div>
            )}

            {/* Glow Effect */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-20 ${color === 'primary' ? 'bg-emerald-500' :
                    color === 'danger' ? 'bg-rose-500' :
                        'bg-indigo-500'
                }`} />
        </div>
    );
};
