'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { StatCard } from '@/components/dashboard/StatCard'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { BetHistoryTable } from '@/components/dashboard/BetHistoryTable'
import { AIInsightCard } from '@/components/dashboard/AIInsightCard'
import { ScalshoriCard } from '@/components/dashboard/ScalshoriCard'
import { MonthlyStatsGrid } from '@/components/dashboard/MonthlyStatsGrid'
import { Wallet, TrendingUp, Activity, PieChart, Plus } from 'lucide-react'
import BetForm from '@/components/BetForm'

export default function TipsterPage() {
    const { id } = useParams()
    const [tipster, setTipster] = useState(null)
    const [bets, setBets] = useState([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)
    const [currentBankroll, setCurrentBankroll] = useState(0)

    // Edit states
    const [isEditingInitial, setIsEditingInitial] = useState(false)
    const [tempInitial, setTempInitial] = useState('')

    const router = useRouter()

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)
            await fetchTipster()
            await fetchBets(user.id)
            setLoading(false)
        }

        const refreshData = async () => {
            await fetchTipster()
            await fetchBets(user?.id)
        }
        init()
    }, [id])

    useEffect(() => {
        if (tipster && bets) {
            calculateBankroll()
        }
    }, [bets, tipster])

    const calculateBankroll = () => {
        if (!tipster) return
        let totalProfit = 0
        bets.forEach(bet => {
            const status = bet.status?.toLowerCase()
            if (status === 'won' || status === 'vinta') {
                totalProfit += (Number(bet.stake) * Number(bet.odds)) - Number(bet.stake)
            } else if (status === 'lost' || status === 'persa') {
                totalProfit -= Number(bet.stake)
            }
        })
        const withdrawals = tipster.total_withdrawals || 0
        setCurrentBankroll(tipster.initial_bankroll + totalProfit - withdrawals)
    }

    const fetchTipster = async () => {
        const { data, error } = await supabase.from('tipsters').select('*').eq('id', id).single()
        if (error) console.error('Error fetching tipster:', error)
        else setTipster(data)
    }

    const fetchBets = async (userId) => {
        const { data, error } = await supabase.from('bets').select('*').eq('tipster_id', id).order('created_at', { ascending: false })
        if (error) console.error('Error fetching bets:', error)
        else setBets(data || [])
    }

    const updateInitialBankroll = async () => {
        const newInitial = parseFloat(tempInitial)
        if (isNaN(newInitial) || newInitial < 0) return
        const { error } = await supabase.from('tipsters').update({ initial_bankroll: newInitial }).eq('id', id)
        if (!error) {
            setTipster({ ...tipster, initial_bankroll: newInitial })
            setIsEditingInitial(false)
        }
    }

    const addBet = async (newBet) => {
        const betWithTipster = { ...newBet, user_id: user.id, tipster_id: id }
        const { data, error } = await supabase.from('bets').insert([betWithTipster]).select()
        if (error) alert('Errore: ' + error.message)
        else {
            setBets([data[0], ...bets])
            // Force refresh tipster to get updated bankroll if needed
        }
    }

    const updateBet = async (betId, updates) => {
        const { error } = await supabase.from('bets').update(updates).eq('id', betId)
        if (!error) {
            setBets(bets.map(b => b.id === betId ? { ...b, ...updates } : b))
        } else {
            alert('Errore aggiornamento: ' + error.message)
        }
    }

    const deleteBet = async (betId) => {
        if (!confirm('Sei sicuro di voler eliminare questa schedina?')) return
        const { error } = await supabase.from('bets').delete().eq('id', betId)
        if (!error) {
            setBets(bets.filter(b => b.id !== betId))
        } else {
            alert('Errore eliminazione: ' + error.message)
        }
    }

    // --- Stats Calculation (Memoized) ---
    const { history, stats, kpis } = useMemo(() => {
        if (!tipster) return { history: [], stats: {}, kpis: [] }

        const initial = Number(tipster.initial_bankroll) || 0
        let runningBankroll = initial
        let won = 0, lost = 0, totalStaked = 0, runningProfit = 0

        // Create daily history map
        // We need to process bets in chronological order for the chart
        const sortedBets = [...bets].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

        const dailyMap = new Map()
        dailyMap.set('Start', initial)

        sortedBets.forEach(bet => {
            const status = bet.status?.toLowerCase()
            if (status === 'pending' || status === 'in corso') return

            totalStaked += Number(bet.stake)
            let profit = 0
            if (status === 'won' || status === 'vinta') {
                profit = (Number(bet.stake) * Number(bet.odds)) - Number(bet.stake)
                won++
            } else if (status === 'lost' || status === 'persa') {
                profit = -Number(bet.stake)
                lost++
            }

            runningProfit += profit
            runningBankroll = initial + runningProfit

            const date = new Date(bet.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
            dailyMap.set(date, runningBankroll)
        })

        const historyData = Array.from(dailyMap.entries()).map(([date, value]) => ({ date, value }))
        const totalProfit = runningProfit
        const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0
        const winRate = (won + lost) > 0 ? (won / (won + lost)) * 100 : 0

        const kpiList = [
            {
                label: 'Bankroll Attuale',
                value: `€${currentBankroll.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
                sub: initial > 0 ? `${((currentBankroll - initial) / initial * 100).toFixed(1)}% vs Start` : 'N/A',
                icon: Wallet,
                color: 'primary'
            },
            {
                label: 'Profitto Netto',
                value: `€${totalProfit.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
                sub: 'Totale vincite',
                icon: TrendingUp,
                color: totalProfit >= 0 ? 'primary' : 'danger'
            },
            {
                label: 'ROI Totale',
                value: `${roi.toFixed(1)}%`,
                sub: 'Yield',
                icon: Activity,
                color: roi >= 0 ? 'accent' : 'danger'
            },
            {
                label: 'Win Rate',
                value: `${winRate.toFixed(1)}%`,
                sub: `${won}V - ${lost}P`,
                icon: PieChart,
                color: winRate > 50 ? 'primary' : 'danger'
            },
        ]

        return { history: historyData, stats: { winRate, won, lost }, kpis: kpiList }
    }, [bets, tipster, currentBankroll])

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-[#0a0a0f]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    )
    if (!tipster) return <div className="text-white p-8">Tipster non trovato</div>

    return (
        <div className="p-6 md:p-8 space-y-8 bg-[#0a0a0f] min-h-screen text-white font-sans">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <span className="w-2 h-8 bg-primary rounded-full block"></span>
                        {tipster.name}
                    </h1>

                    {/* Bankroll Edit Inline */}
                    <div className="flex items-center gap-3 mt-2 text-gray-400 text-sm">
                        <span>Bankroll Iniziale:</span>
                        {isEditingInitial ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={tempInitial}
                                    onChange={e => setTempInitial(e.target.value)}
                                    className="bg-white/10 border border-white/20 rounded px-2 py-1 w-24 text-white"
                                    autoFocus
                                />
                                <button onClick={updateInitialBankroll} className="text-emerald-400 hover:text-emerald-300">✓</button>
                                <button onClick={() => setIsEditingInitial(false)} className="text-rose-400 hover:text-rose-300">✕</button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { setTempInitial(tipster.initial_bankroll); setIsEditingInitial(true) }}
                                className="font-mono font-bold text-white hover:text-primary transition-colors border-b border-dashed border-white/20"
                            >
                                €{Number(tipster.initial_bankroll).toFixed(2)}
                            </button>
                        )}
                        <span className="mx-2">•</span>
                        <span>Start Date: {new Date(tipster.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                            <Activity className="w-5 h-5 text-primary" />
                            Andamento Bankroll
                        </h3>
                    </div>
                    {history.length > 0 ? (
                        <TrendChart data={history} color={currentBankroll >= (Number(tipster.initial_bankroll) || 0) ? "#10b981" : "#ef4444"} gradientId="tipsterChart" />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">Nessun dato storico disponibile</div>
                    )}
                </div>

                {/* Scalshori & AI Panel */}
                <div className="space-y-6">
                    <ScalshoriCard
                        tipster={tipster}
                        currentBankroll={currentBankroll}
                        onUpdate={() => { fetchTipster(); fetchBets(user?.id); }}
                    />
                    <AIInsightCard data={history} />
                </div>
            </div>

            {/* New Bet Form Section */}
            <div className="glass-card p-6 border-l-4 border-primary">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Plus className="w-6 h-6 text-primary" />
                    Nuova Giocata
                </h3>
                <BetForm onAddBet={addBet} currentTipster={tipster} />
            </div>

            {/* Monthly Stats Grid */}
            <MonthlyStatsGrid bets={bets} initialBankroll={tipster.initial_bankroll} />

            {/* Bet History Table */}
            <BetHistoryTable bets={bets} onUpdateBet={updateBet} onDeleteBet={deleteBet} />

        </div>
    )
}
