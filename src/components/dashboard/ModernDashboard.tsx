'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { StatCard } from './StatCard';
import { TrendChart } from './TrendChart';
import { AIInsightCard } from './AIInsightCard';
import { BetHistoryTable } from './BetHistoryTable';
import BetForm from '../BetForm';
import { Wallet, TrendingUp, TrendingDown, Activity, PieChart, Loader2, Plus, Calendar, Filter, LogOut } from 'lucide-react';

// Interfaces
interface Bet {
    id: string;
    created_at: string;
    stake: number;
    odds: number;
    status: 'Won' | 'Lost' | 'Void' | 'Pending';
    category?: string;
    description?: string;
    tipster_id?: string;
}

interface Tipster {
    id: string;
    initial_bankroll: number;
}

export default function ModernDashboard() {
    const [loading, setLoading] = useState(true);
    const [bets, setBets] = useState<Bet[]>([]);
    const [originalBets, setOriginalBets] = useState<Bet[]>([]);
    const [initialBankroll, setInitialBankroll] = useState(0);
    const [user, setUser] = useState<any>(null);

    // UI States
    const [showBetForm, setShowBetForm] = useState(false);
    const [timeFilter, setTimeFilter] = useState<'all' | '30d' | '7d' | 'month'>('all');
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null); // formato: "2026-01"

    // Calcola mesi disponibili dalle scommesse
    const availableMonths = useMemo(() => {
        if (originalBets.length === 0) return [];
        const monthsSet = new Set<string>();
        originalBets.forEach(bet => {
            const date = new Date(bet.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthsSet.add(monthKey);
        });
        return Array.from(monthsSet).sort().reverse();
    }, [originalBets]);

    // Formatta mese per display
    const formatMonthLabel = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(Number(year), Number(month) - 1);
        return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    };

    // Auth & Data Fetching
    useEffect(() => {
        async function initDashboard() {
            try {
                // 1. Check Session
                const { data: { session }, error: authError } = await supabase.auth.getSession();

                if (authError || !session) {
                    console.log('No active session, redirecting to login...');
                    window.location.href = '/login';
                    return;
                }

                setUser(session.user);
                console.log('User authenticated:', session.user.id);

                // 2. Fetch Bets
                const { data: betsData, error: betsError } = await supabase
                    .from('bets')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (betsError) throw betsError;

                // 3. Fetch Initial Capital
                const { data: tipstersData, error: tipstersError } = await supabase
                    .from('tipsters')
                    .select('initial_bankroll');

                if (tipstersError) throw tipstersError;

                const loadedBets = betsData || [];
                setBets(loadedBets);
                setOriginalBets(loadedBets); // Keep copy for filtering

                const totalInitial = tipstersData?.reduce((acc, t) => acc + (Number(t.initial_bankroll) || 0), 0) || 0;
                setInitialBankroll(totalInitial);

            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        }

        initDashboard();
    }, []);

    // Filter Logic
    useEffect(() => {
        if (!originalBets.length) return;

        const now = new Date();
        let filtered = [...originalBets];

        if (timeFilter === '30d') {
            const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(b => new Date(b.created_at) >= cutoff);
        } else if (timeFilter === '7d') {
            const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(b => new Date(b.created_at) >= cutoff);
        } else if (timeFilter === 'month' && selectedMonth) {
            const [year, month] = selectedMonth.split('-').map(Number);
            filtered = filtered.filter(b => {
                const date = new Date(b.created_at);
                return date.getFullYear() === year && date.getMonth() === month - 1;
            });
        }

        setBets(filtered);
    }, [timeFilter, originalBets, selectedMonth]);


    // Handlers
    const handleAddBet = async (newBet: any) => {
        if (!user) return;

        const betToInsert = {
            ...newBet,
            user_id: user.id
            // tipster_id is already in newBet if selected in form
        };

        const { data, error } = await supabase.from('bets').insert([betToInsert]).select();

        if (error) {
            alert('Errore inserimento: ' + error.message);
        } else {
            const addedBet = data[0];
            setOriginalBets(prev => [...prev, addedBet]);
            // Logic to add to current 'bets' if it matches filter? Usually yes since it's "now"
            setBets(prev => [...prev, addedBet]);
            setShowBetForm(false); // Close form on success
        }
    };

    const handleUpdateBet = async (betId: string, updates: Partial<Bet>) => {
        const { error } = await supabase.from('bets').update(updates).eq('id', betId);
        if (!error) {
            const updatedList = originalBets.map(b => b.id === betId ? { ...b, ...updates } : b);
            setOriginalBets(updatedList);
            // Also update current view
            setBets(prev => prev.map(b => b.id === betId ? { ...b, ...updates } : b));
        } else {
            alert('Errore aggiornamento: ' + error.message);
        }
    };

    const handleDeleteBet = async (betId: string) => {
        if (!confirm('Sei sicuro?')) return;
        const { error } = await supabase.from('bets').delete().eq('id', betId);
        if (!error) {
            setOriginalBets(prev => prev.filter(b => b.id !== betId));
            setBets(prev => prev.filter(b => b.id !== betId));
        } else {
            alert('Errore eliminazione: ' + error.message);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };


    // Calculate Stats & History
    const { history, stats, kpis } = useMemo(() => {
        if (bets.length === 0) return {
            history: [],
            stats: { winRate: 0, won: 0, lost: 0 },
            kpis: []
        };

        const startCapital = timeFilter === 'all' ? initialBankroll : 0;
        let runningBankroll = startCapital;
        let runningProfit = 0;
        let totalStaked = 0;
        let wonCount = 0;
        let lostCount = 0;
        let resolvedCount = 0;

        const dailyMap = new Map<string, number>();
        dailyMap.set('Start', startCapital);

        // Sort by date asc for calculation
        const sortedBets = [...bets].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        sortedBets.forEach(bet => {
            if (!bet.status || bet.status.toLowerCase() === 'pending' || bet.status.toLowerCase() === 'in corso') return;

            const date = new Date(bet.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

            totalStaked += Number(bet.stake);
            let profit = 0;

            const status = bet.status ? bet.status.toLowerCase() : 'pending';

            if (status === 'won' || status === 'win' || status === 'vinta') {
                profit = (Number(bet.stake) * Number(bet.odds)) - Number(bet.stake);
                wonCount++;
                resolvedCount++;
            } else if (status === 'lost' || status === 'lose' || status === 'persa') {
                profit = -Number(bet.stake);
                lostCount++;
                resolvedCount++;
            } else if (status === 'void' || status === 'nulla') {
                resolvedCount++;
            }

            runningProfit += profit;
            runningBankroll = startCapital + runningProfit;

            dailyMap.set(date, runningBankroll);
        });

        const historyData = Array.from(dailyMap.entries()).map(([date, value]) => ({ date, value }));

        const totalProfit = runningProfit;
        const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;
        const winRate = resolvedCount > 0 ? (wonCount / resolvedCount) * 100 : 0;

        const kpiList = [
            {
                label: timeFilter === 'all' ? 'Bankroll Attuale' : 'Bilancio Periodo',
                value: `€${runningBankroll.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
                sub: timeFilter === 'all' && initialBankroll > 0 ? `${((runningBankroll - initialBankroll) / initialBankroll * 100).toFixed(1)}% vs Start` : undefined,
                icon: Wallet,
                color: 'primary' as const
            },
            {
                label: 'Profitto Netto',
                value: `€${totalProfit.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
                sub: 'Nel periodo',
                icon: TrendingUp,
                color: totalProfit >= 0 ? 'primary' as const : 'danger' as const
            },
            {
                label: 'ROI',
                value: `${roi.toFixed(1)}%`,
                sub: 'Yield',
                icon: Activity,
                color: roi >= 0 ? 'accent' as const : 'danger' as const
            },
            {
                label: 'Win Rate',
                value: `${winRate.toFixed(1)}%`,
                sub: `${wonCount}V - ${lostCount}P`,
                icon: PieChart,
                color: winRate > 50 ? 'primary' as const : 'danger' as const
            },
        ];

        return {
            history: historyData,
            stats: { winRate, won: wonCount, lost: lostCount },
            kpis: kpiList
        };

    }, [bets, initialBankroll, timeFilter]);


    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0a0f] text-white">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    // Safely calculate max/min
    const maxBalance = history.length > 0 ? Math.max(...history.map(h => h.value)) : 0;
    const minBalance = history.length > 0 ? Math.min(...history.map(h => h.value)) : 0;
    const startVal = history[0]?.value || 0;
    const endVal = history[history.length - 1]?.value || 0;
    const variation = endVal - startVal;

    return (
        <div className="p-6 md:p-8 space-y-8 bg-[#0a0a0f] min-h-screen text-white font-sans">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Performance Dashboard
                    </h1>
                    <p className="text-gray-400 mt-1">Bentornato, Pro Tipster 👋</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    {/* Time Filter Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setTimeFilter('all'); setSelectedMonth(null); }}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${timeFilter === 'all' ? 'bg-primary text-black border-primary' : 'bg-surface border-white/10 hover:bg-surfaceHighlight'}`}
                        >
                            Tutto
                        </button>
                        <button
                            onClick={() => { setTimeFilter('30d'); setSelectedMonth(null); }}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${timeFilter === '30d' ? 'bg-primary text-black border-primary' : 'bg-surface border-white/10 hover:bg-surfaceHighlight'}`}
                        >
                            30gg
                        </button>
                    </div>

                    {/* Month Selector */}
                    <select
                        value={selectedMonth || ''}
                        onChange={(e) => {
                            if (e.target.value) {
                                setSelectedMonth(e.target.value);
                                setTimeFilter('month');
                            } else {
                                setSelectedMonth(null);
                                setTimeFilter('all');
                            }
                        }}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors bg-surface border-white/10 hover:bg-surfaceHighlight cursor-pointer ${timeFilter === 'month' ? 'ring-2 ring-primary border-primary' : ''}`}
                    >
                        <option value="">Seleziona Mese</option>
                        {availableMonths.map(month => (
                            <option key={month} value={month}>
                                {formatMonthLabel(month)}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowBetForm(!showBetForm)}
                        className={`px-4 py-2 rounded-lg text-black font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 ${showBetForm ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-primary hover:brightness-110'}`}
                    >
                        {showBetForm ? 'Annulla' : 'Nuova Schedina +'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* New Bet Form Collapsible */}
            {showBetForm && (
                <div className="glass-card p-6 border-l-4 border-primary animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Plus className="w-6 h-6 text-primary" />
                        Aggiungi Nuova Giocata
                    </h3>
                    <BetForm onAddBet={handleAddBet} />
                </div>
            )}

            {/* Empty State (only if no bets AT ALL and not filtering) */}
            {bets.length === 0 && originalBets.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-center">
                    <h2 className="text-2xl font-bold mb-4">Inizia il tuo viaggio 🚀</h2>
                    <p className="text-gray-400 mb-8">Nessuna schedina presente. Aggiungi la prima qui sopra!</p>
                </div>
            ) : (
                <>
                    {/* KPI Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {kpis.map((stat, idx) => (
                            <StatCard
                                key={idx}
                                label={stat.label}
                                value={stat.value}
                                subValue={stat.sub}
                                icon={stat.icon}
                                color={stat.color}
                                trend={stat.color === 'danger' ? 'down' : 'up'}
                            />
                        ))}
                    </div>

                    {/* Charts Section - Full Width */}
                    <div className="glass-card p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    Andamento {timeFilter === 'all' ? 'Totale' : 'Periodo'}
                                </h3>
                                <span className={`text-sm font-bold px-3 py-1 rounded-full ${variation >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    {variation >= 0 ? '+' : ''}€{variation.toLocaleString()}
                                </span>
                            </div>
                            <TrendChart
                                data={history}
                                color={variation >= 0 ? "#10b981" : "#ef4444"}
                                gradientId="bankrollGradient"
                            />

                            {/* Stats Footer */}
                            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/5">
                                <div>
                                    <p className="text-gray-400 text-xs uppercase font-semibold">Massimo</p>
                                    <p className="text-emerald-400 font-bold text-lg">€{maxBalance.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase font-semibold">Minimo</p>
                                    <p className="text-rose-400 font-bold text-lg">€{minBalance.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase font-semibold">Media</p>
                                    <p className="text-indigo-400 font-bold text-lg">
                                        €{(history.reduce((a, b) => a + b.value, 0) / (history.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Stats Card */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-primary" />
                            Statistiche {timeFilter === 'month' && selectedMonth ? formatMonthLabel(selectedMonth) : timeFilter === '30d' ? 'Ultimi 30 Giorni' : 'Totali'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Totale */}
                            <div className="bg-surface rounded-xl p-4 border border-white/5">
                                <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Totale Periodo</p>
                                <p className="text-2xl font-bold text-white">
                                    €{(history[history.length - 1]?.value || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {variation >= 0 ? '+' : ''}€{variation.toLocaleString('it-IT', { minimumFractionDigits: 2 })} variazione
                                </p>
                            </div>

                            {/* Win Rate */}
                            <div className="bg-surface rounded-xl p-4 border border-white/5">
                                <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Win Rate</p>
                                <p className={`text-2xl font-bold ${stats.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {stats.winRate.toFixed(1)}%
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {stats.won}V - {stats.lost}P
                                </p>
                            </div>

                            {/* ROI */}
                            <div className="bg-surface rounded-xl p-4 border border-white/5">
                                <p className="text-gray-400 text-xs uppercase font-semibold mb-1">ROI</p>
                                <p className={`text-2xl font-bold ${(kpis.find(k => k.label === 'ROI')?.color || 'accent') === 'danger' ? 'text-rose-400' : 'text-indigo-400'}`}>
                                    {kpis.find(k => k.label === 'ROI')?.value || '0%'}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Yield sul totale puntato</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Analyst Section - Full Width */}
                    <AIInsightCard data={history} />

                    {/* Recent Bets Table */}
                    <div className="mt-6">
                        {/* Enable Editing in Main Dashboard too */}
                        <BetHistoryTable bets={bets} onUpdateBet={handleUpdateBet} onDeleteBet={handleDeleteBet} />
                    </div>
                </>
            )}
        </div>
    );
}
