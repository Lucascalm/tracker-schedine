function Dashboard({ bets, totalWithdrawals = 0 }) {
    const totalBets = bets.length
    const wonBets = bets.filter(b => b.status === 'won').length
    const lostBets = bets.filter(b => b.status === 'lost').length
    const pendingBets = bets.filter(b => b.status === 'pending').length

    const totalStaked = bets.reduce((sum, bet) => sum + parseFloat(bet.stake || 0), 0)

    const totalWinnings = bets
        .filter(b => b.status === 'won')
        .reduce((sum, bet) => sum + (parseFloat(bet.stake) * parseFloat(bet.odds)), 0)

    const totalLosses = bets
        .filter(b => b.status === 'lost')
        .reduce((sum, bet) => sum + parseFloat(bet.stake || 0), 0)

    const netProfit = totalWinnings - totalStaked
    // Net balance after withdrawals
    const netBalance = netProfit - totalWithdrawals

    // ROI = (Profitto / Totale Puntato) * 100
    const totalStakedResolved = bets
        .filter(b => b.status === 'won' || b.status === 'lost')
        .reduce((sum, bet) => sum + parseFloat(bet.stake || 0), 0)
    const roi = totalStakedResolved > 0 ? (netProfit / totalStakedResolved) * 100 : 0

    return (
        <div className="dashboard-grid">
            <div className="glass-panel stat-card">
                <div className="stat-label">💵 Saldo Netto</div>
                <div className={`stat-value ${netBalance >= 0 ? 'positive' : 'negative'}`}>
                    €{netBalance.toFixed(2)}
                </div>
                {totalWithdrawals > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        (Prelievi: €{totalWithdrawals.toFixed(2)})
                    </div>
                )}
            </div>

            <div className="glass-panel stat-card">
                <div className="stat-label">📈 ROI</div>
                <div className="stat-value" style={{ color: roi >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                </div>
            </div>

            <div className="glass-panel stat-card">
                <div className="stat-label">📊 Schedine Totali</div>
                <div className="stat-value">{totalBets}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    ✅ {wonBets} • ❌ {lostBets} • ⏳ {pendingBets}
                </div>
            </div>

            <div className="glass-panel stat-card">
                <div className="stat-label">💰 Puntate Totali</div>
                <div className="stat-value">€{totalStaked.toFixed(2)}</div>
            </div>
        </div>
    )
}

export default Dashboard
