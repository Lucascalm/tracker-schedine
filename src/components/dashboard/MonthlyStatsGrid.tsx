'use client'

import React, { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface Bet {
    id: string
    created_at: string
    stake: number
    odds: number
    status: string
}

interface MonthlyStatsGridProps {
    bets: Bet[]
    initialBankroll?: number
}

interface MonthData {
    key: string
    label: string
    bets: Bet[]
    won: number
    lost: number
    profit: number
    staked: number
    roi: number
    winRate: number
}

export const MonthlyStatsGrid: React.FC<MonthlyStatsGridProps> = ({ bets, initialBankroll = 0 }) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    // Calculate monthly stats
    const monthlyData = useMemo(() => {
        const monthsMap = new Map<string, MonthData>()

        bets.forEach(bet => {
            const date = new Date(bet.created_at)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            const monthLabel = date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })

            if (!monthsMap.has(monthKey)) {
                monthsMap.set(monthKey, {
                    key: monthKey,
                    label: monthLabel,
                    bets: [],
                    won: 0,
                    lost: 0,
                    profit: 0,
                    staked: 0,
                    roi: 0,
                    winRate: 0
                })
            }

            const month = monthsMap.get(monthKey)!
            month.bets.push(bet)

            const status = bet.status?.toLowerCase()
            if (status === 'won' || status === 'vinta') {
                month.won++
                const profit = (Number(bet.stake) * Number(bet.odds)) - Number(bet.stake)
                month.profit += profit
                month.staked += Number(bet.stake)
            } else if (status === 'lost' || status === 'persa') {
                month.lost++
                month.profit -= Number(bet.stake)
                month.staked += Number(bet.stake)
            }
        })

        // Calculate ROI and Win Rate for each month
        monthsMap.forEach(month => {
            const totalResolved = month.won + month.lost
            month.roi = month.staked > 0 ? (month.profit / month.staked) * 100 : 0
            month.winRate = totalResolved > 0 ? (month.won / totalResolved) * 100 : 0
        })

        return Array.from(monthsMap.values()).sort((a, b) => b.key.localeCompare(a.key))
    }, [bets])

    // Get available years
    const availableYears = useMemo(() => {
        const years = new Set<number>()
        monthlyData.forEach(m => {
            const year = parseInt(m.key.split('-')[0])
            years.add(year)
        })
        return Array.from(years).sort((a, b) => b - a)
    }, [monthlyData])

    // Filter by selected year
    const filteredMonths = monthlyData.filter(m => m.key.startsWith(String(selectedYear)))

    // Calculate year totals
    const yearTotals = useMemo(() => {
        return filteredMonths.reduce((acc, m) => ({
            profit: acc.profit + m.profit,
            won: acc.won + m.won,
            lost: acc.lost + m.lost,
            staked: acc.staked + m.staked
        }), { profit: 0, won: 0, lost: 0, staked: 0 })
    }, [filteredMonths])

    const yearRoi = yearTotals.staked > 0 ? (yearTotals.profit / yearTotals.staked) * 100 : 0
    const yearWinRate = (yearTotals.won + yearTotals.lost) > 0
        ? (yearTotals.won / (yearTotals.won + yearTotals.lost)) * 100
        : 0

    if (monthlyData.length === 0) {
        return (
            <div className="glass-card p-6 text-center text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nessuna statistica mensile disponibile</p>
            </div>
        )
    }

    return (
        <div className="glass-card p-6">
            {/* Header with Year Selector */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Statistiche Mensili
                </h3>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            const idx = availableYears.indexOf(selectedYear)
                            if (idx < availableYears.length - 1) setSelectedYear(availableYears[idx + 1])
                        }}
                        disabled={availableYears.indexOf(selectedYear) === availableYears.length - 1}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-white font-bold min-w-[60px] text-center">{selectedYear}</span>
                    <button
                        onClick={() => {
                            const idx = availableYears.indexOf(selectedYear)
                            if (idx > 0) setSelectedYear(availableYears[idx - 1])
                        }}
                        disabled={availableYears.indexOf(selectedYear) === 0}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Year Summary */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 mb-6 border border-indigo-500/20">
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-xs text-gray-400 uppercase mb-1">Profitto Anno</p>
                        <p className={`text-xl font-bold ${yearTotals.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {yearTotals.profit >= 0 ? '+' : ''}€{yearTotals.profit.toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase mb-1">ROI Anno</p>
                        <p className={`text-xl font-bold ${yearRoi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {yearRoi.toFixed(1)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase mb-1">Win Rate</p>
                        <p className={`text-xl font-bold ${yearWinRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {yearWinRate.toFixed(1)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase mb-1">Scommesse</p>
                        <p className="text-xl font-bold text-white">
                            {yearTotals.won + yearTotals.lost}
                        </p>
                    </div>
                </div>
            </div>

            {/* Monthly Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMonths.map(month => (
                    <div
                        key={month.key}
                        className={`bg-surface rounded-xl p-4 border transition-colors ${month.profit >= 0 ? 'border-emerald-500/20 hover:border-emerald-500/40' : 'border-rose-500/20 hover:border-rose-500/40'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-medium capitalize">
                                {new Date(month.key + '-01').toLocaleDateString('it-IT', { month: 'long' })}
                            </span>
                            {month.profit >= 0 ? (
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-rose-400" />
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-400 text-sm">Profitto</span>
                                <span className={`font-bold ${month.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {month.profit >= 0 ? '+' : ''}€{month.profit.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 text-sm">ROI</span>
                                <span className={`font-medium ${month.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {month.roi.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 text-sm">Win Rate</span>
                                <span className="text-white font-medium">
                                    {month.winRate.toFixed(0)}% ({month.won}V-{month.lost}P)
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredMonths.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                    Nessun dato per {selectedYear}
                </div>
            )}
        </div>
    )
}
