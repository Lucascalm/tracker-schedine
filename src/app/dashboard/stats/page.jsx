'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function StatsPage() {
    const [tipsters, setTipsters] = useState([])
    const [allBets, setAllBets] = useState([])
    const [withdrawals, setWithdrawals] = useState([])
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('all')
    const [sortBy, setSortBy] = useState('profit')
    const [customAmounts, setCustomAmounts] = useState({}) // Custom withdrawal amounts per tipster
    const router = useRouter()

    const timeRanges = [
        { key: '1m', label: '1 Mese' },
        { key: '3m', label: '3 Mesi' },
        { key: '6m', label: '6 Mesi' },
        { key: '1y', label: '1 Anno' },
        { key: 'all', label: 'Tutto' }
    ]

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            await Promise.all([fetchTipsters(), fetchAllBets(), fetchWithdrawals()])
            setLoading(false)
        }
        init()
    }, [])

    const fetchTipsters = async () => {
        const { data } = await supabase.from('tipsters').select('*').order('name')
        if (data) setTipsters(data)
    }

    const fetchAllBets = async () => {
        const { data } = await supabase.from('bets').select('*').order('created_at', { ascending: false })
        if (data) setAllBets(data)
    }

    const fetchWithdrawals = async () => {
        const { data } = await supabase.from('withdrawals').select('*').order('created_at', { ascending: false })
        if (data) setWithdrawals(data)
    }

    const getFilteredBets = (tipsterId = null) => {
        let filtered = allBets
        if (tipsterId) filtered = filtered.filter(b => b.tipster_id === tipsterId)

        if (timeRange !== 'all') {
            const now = new Date()
            let cutoff = new Date()
            switch (timeRange) {
                case '1m': cutoff.setMonth(now.getMonth() - 1); break
                case '3m': cutoff.setMonth(now.getMonth() - 3); break
                case '6m': cutoff.setMonth(now.getMonth() - 6); break
                case '1y': cutoff.setFullYear(now.getFullYear() - 1); break
            }
            filtered = filtered.filter(b => new Date(b.created_at) >= cutoff)
        }
        return filtered
    }

    const calculateStats = (tipsterId, tipsterData) => {
        const bets = getFilteredBets(tipsterId)
        let totalStaked = 0, profit = 0

        bets.forEach(bet => {
            if (bet.status === 'won') {
                totalStaked += bet.stake
                profit += (bet.stake * bet.odds) - bet.stake
            } else if (bet.status === 'lost') {
                totalStaked += bet.stake
                profit -= bet.stake
            }
        })

        const roi = totalStaked > 0 ? (profit / totalStaked) * 100 : 0
        const profitPercent = tipsterData.initial_bankroll > 0 ? (profit / tipsterData.initial_bankroll) * 100 : 0

        let allTimeBets = allBets.filter(b => b.tipster_id === tipsterId)
        let currentBankroll = tipsterData.initial_bankroll
        allTimeBets.forEach(bet => {
            if (bet.status === 'won') currentBankroll += (bet.stake * bet.odds) - bet.stake
            else if (bet.status === 'lost') currentBankroll -= bet.stake
        })
        currentBankroll -= (tipsterData.total_withdrawals || 0)

        const playingBase = tipsterData.playing_base || currentBankroll
        const margin = playingBase ? currentBankroll - playingBase : 0
        const withdrawalThreshold = tipsterData.withdrawal_threshold
        const thresholdReached = !withdrawalThreshold || currentBankroll >= withdrawalThreshold
        const withdrawable = margin > 0 && thresholdReached ? currentBankroll * 0.26 : 0

        return { roi, profitPercent, profit, totalStaked, withdrawable, currentBankroll, thresholdReached, margin, withdrawalThreshold }
    }

    const handleWithdraw = async (tipster, amount) => {
        if (!amount || amount <= 0) {
            alert('Inserisci un importo valido')
            return
        }

        const confirmWithdraw = window.confirm(`Confermi prelievo di €${amount.toFixed(2)} da ${tipster.name}?`)
        if (!confirmWithdraw) return

        const { data: { user } } = await supabase.auth.getUser()

        const { error: logError } = await supabase.from('withdrawals').insert([{
            tipster_id: tipster.id,
            user_id: user.id,
            amount: amount
        }])

        if (logError) {
            alert('Errore nel log prelievo: ' + logError.message)
            return
        }

        const newTotal = (tipster.total_withdrawals || 0) + amount
        const { error } = await supabase.from('tipsters').update({ total_withdrawals: newTotal }).eq('id', tipster.id)

        if (error) {
            alert('Errore nel prelievo: ' + error.message)
        } else {
            alert(`✅ Prelievo di €${amount.toFixed(2)} effettuato!`)
            setCustomAmounts({ ...customAmounts, [tipster.id]: '' })
            await Promise.all([fetchTipsters(), fetchWithdrawals()])
        }
    }

    const handleCancelWithdrawal = async (withdrawal) => {
        const tipster = tipsters.find(t => t.id === withdrawal.tipster_id)
        if (!tipster) return

        const confirmCancel = window.confirm(`Annullare prelievo di €${parseFloat(withdrawal.amount).toFixed(2)}?`)
        if (!confirmCancel) return

        const { error: deleteError } = await supabase.from('withdrawals').delete().eq('id', withdrawal.id)
        if (deleteError) {
            alert('Errore: ' + deleteError.message)
            return
        }

        const newTotal = Math.max(0, (tipster.total_withdrawals || 0) - withdrawal.amount)
        await supabase.from('tipsters').update({ total_withdrawals: newTotal }).eq('id', tipster.id)

        alert('✅ Prelievo annullato!')
        await Promise.all([fetchTipsters(), fetchWithdrawals()])
    }

    const getTipsterStats = () => {
        const stats = tipsters.map(t => ({ ...t, ...calculateStats(t.id, t) }))
        return stats.sort((a, b) => {
            switch (sortBy) {
                case 'roi': return b.roi - a.roi
                case 'profitPercent': return b.profitPercent - a.profitPercent
                default: return b.profit - a.profit
            }
        })
    }

    const tipsterStats = getTipsterStats()
    const withdrawableTipsters = tipsterStats.filter(t => t.thresholdReached && t.margin > 0)
    const totalWithdrawable = withdrawableTipsters.reduce((sum, t) => sum + t.withdrawable, 0)

    // Calculate all-time total withdrawals
    const allTimeWithdrawals = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0)

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    if (loading) return <div>Caricamento Statistiche...</div>

    return (
        <div className="container">
            <h1 className="title">💰 Prelievi e Statistiche</h1>

            {/* Stats Summary Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>💸 Prelevabile Ora</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>€{totalWithdrawable.toFixed(2)}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>📊 Prelievi Totali (All Time)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>€{allTimeWithdrawals.toFixed(2)}</div>
                </div>
            </div>

            {/* Active Withdrawable Tipsters */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(99, 102, 241, 0.08))' }}>
                <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>💸 Preleva da Tipster</h2>

                {withdrawableTipsters.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {withdrawableTipsters.map(t => (
                            <div key={t.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem 1.25rem', borderRadius: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                                    <div>
                                        <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>👤 {t.name}</span>
                                        <span style={{ color: 'var(--text-muted)', marginLeft: '1rem', fontSize: '0.9rem' }}>Saldo: €{t.currentBankroll.toFixed(2)}</span>
                                    </div>
                                    <div style={{ color: 'var(--success)', fontWeight: '600' }}>
                                        Max prelevabile: €{t.withdrawable.toFixed(2)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Importo €"
                                        value={customAmounts[t.id] || ''}
                                        onChange={(e) => setCustomAmounts({ ...customAmounts, [t.id]: e.target.value })}
                                        style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white', width: '140px' }}
                                    />
                                    <button onClick={() => handleWithdraw(t, parseFloat(customAmounts[t.id]) || 0)} style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '500', cursor: 'pointer' }}>
                                        Preleva Importo
                                    </button>
                                    <button onClick={() => handleWithdraw(t, t.withdrawable)} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, var(--success), #059669)', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
                                        💸 Preleva Max (€{t.withdrawable.toFixed(2)})
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Nessun tipster con prelievi attivi. Raggiungi la soglia impostata.
                    </div>
                )}
            </div>

            {/* Withdrawal History */}
            {withdrawals.length > 0 && (
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>📋 Storico Prelievi</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {withdrawals.map(w => {
                            const tipster = tipsters.find(t => t.id === w.tipster_id)
                            return (
                                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(w.created_at)}</span>
                                        <span style={{ fontWeight: '500' }}>{tipster?.name || 'Tipster eliminato'}</span>
                                        <span style={{ color: 'var(--success)', fontWeight: '600' }}>€{parseFloat(w.amount).toFixed(2)}</span>
                                    </div>
                                    <button onClick={() => handleCancelWithdrawal(w)} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--danger)', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
                                        ❌ Annulla
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Time Range Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {timeRanges.map(tr => (
                    <button key={tr.key} onClick={() => setTimeRange(tr.key)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: timeRange === tr.key ? 'var(--primary)' : 'var(--bg-card)', color: 'white', cursor: 'pointer', fontWeight: timeRange === tr.key ? '600' : '400' }}>
                        {tr.label}
                    </button>
                ))}
            </div>

            {/* Stats Table */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>📊 Classifica Tipster</h2>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>Ordina per:</span>
                    {[{ key: 'profit', label: '€ Profitto' }, { key: 'roi', label: 'ROI %' }, { key: 'profitPercent', label: '% Profitto' }].map(s => (
                        <button key={s.key} onClick={() => setSortBy(s.key)} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: sortBy === s.key ? '2px solid var(--primary)' : '1px solid var(--border-color)', background: 'transparent', color: sortBy === s.key ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: sortBy === s.key ? '600' : '400', fontSize: '0.9rem' }}>
                            {s.label}
                        </button>
                    ))}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>#</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Tipster</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>ROI %</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>% Profitto</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>€ Profitto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tipsterStats.map((t, idx) => (
                                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }} onClick={() => router.push(`/dashboard/tipster/${t.id}`)} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '1rem', fontWeight: '600', color: idx < 3 ? 'var(--warning)' : 'var(--text-muted)' }}>
                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{t.name}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', color: t.roi >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '600' }}>
                                        {t.roi >= 0 ? '+' : ''}{t.roi.toFixed(1)}%
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', color: t.profitPercent >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '500' }}>
                                        {t.profitPercent >= 0 ? '+' : ''}{t.profitPercent.toFixed(1)}%
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', color: t.profit >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '700', fontSize: '1.1rem' }}>
                                        {t.profit >= 0 ? '+' : ''}€{t.profit.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {tipsterStats.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nessun tipster trovato</div>
                )}
            </div>
        </div>
    )
}
