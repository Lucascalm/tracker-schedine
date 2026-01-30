function MonthlyStats({ bets }) {
    // Group bets by month (excluding "Prelievi" category)
    const getBetsByMonth = () => {
        const grouped = {}

        bets.forEach(bet => {
            // Skip bets with category "Prelievi" from monthly statistics
            if (bet.category === 'Prelievi') {
                return
            }

            const date = new Date(bet.created_at)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            const monthLabel = date.toLocaleDateString('it-IT', { year: 'numeric', month: 'long' })

            if (!grouped[monthKey]) {
                grouped[monthKey] = {
                    label: monthLabel,
                    bets: [],
                    total: 0,
                    won: 0,
                    lost: 0,
                    pending: 0
                }
            }

            grouped[monthKey].bets.push(bet)
            grouped[monthKey].total++

            if (bet.status === 'won') grouped[monthKey].won++
            else if (bet.status === 'lost') grouped[monthKey].lost++
            else grouped[monthKey].pending++
        })

        // Sort by month (newest first)
        return Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([key, value]) => ({ key, ...value }))
    }

    const calculateMonthlyProfit = (monthBets) => {
        const totalStaked = monthBets.reduce((sum, bet) => sum + parseFloat(bet.stake || 0), 0)
        const totalWinnings = monthBets
            .filter(b => b.status === 'won')
            .reduce((sum, bet) => sum + (parseFloat(bet.stake) * parseFloat(bet.odds)), 0)

        return totalWinnings - totalStaked
    }

    const monthlyData = getBetsByMonth()

    if (monthlyData.length === 0) {
        return null
    }

    return (
        <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>📊 Statistiche Mensili</h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {monthlyData.map(month => {
                    const profit = calculateMonthlyProfit(month.bets)
                    const totalStaked = month.bets
                        .filter(b => b.status === 'won' || b.status === 'lost')
                        .reduce((sum, bet) => sum + parseFloat(bet.stake || 0), 0)
                    const roi = totalStaked > 0 ? (profit / totalStaked) * 100 : 0
                    const winRate = month.total > 0 ? ((month.won / (month.won + month.lost)) * 100) || 0 : 0

                    return (
                        <div key={month.key} className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                                        📅 {month.label}
                                    </h3>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {month.total} schedine • ✅ {month.won} • ❌ {month.lost} • ⏳ {month.pending}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                        Saldo
                                    </div>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: profit >= 0 ? 'var(--success)' : 'var(--danger)'
                                    }}>
                                        €{profit.toFixed(2)}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                        ROI
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: roi >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                        {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                                    </div>
                                </div>

                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: `conic-gradient(
                    var(--success) ${winRate * 3.6}deg,
                    var(--danger) ${winRate * 3.6}deg ${(winRate + (month.lost / (month.won + month.lost)) * 100) * 3.6}deg,
                    rgba(255,255,255,0.1) ${(winRate + (month.lost / (month.won + month.lost)) * 100) * 3.6}deg
                  )`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: 'var(--bg-dark)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: '700'
                                    }}>
                                        {month.won}/{month.won + month.lost}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default MonthlyStats
