function CategoryStats({ bets }) {
    // Group bets by category
    const getBetsByCategory = () => {
        const grouped = {}

        bets.forEach(bet => {
            const category = bet.category || 'Altro'

            if (!grouped[category]) {
                grouped[category] = {
                    total: 0,
                    won: 0,
                    lost: 0,
                    pending: 0,
                    totalStaked: 0,
                    totalWinnings: 0
                }
            }

            grouped[category].total++
            grouped[category].totalStaked += parseFloat(bet.stake || 0)

            if (bet.status === 'won') {
                grouped[category].won++
                grouped[category].totalWinnings += parseFloat(bet.stake) * parseFloat(bet.odds)
            } else if (bet.status === 'lost') {
                grouped[category].lost++
            } else {
                grouped[category].pending++
            }
        })

        return Object.entries(grouped)
            .map(([category, data]) => ({
                category,
                ...data,
                profit: data.totalWinnings - data.totalStaked,
                winRate: data.total > 0 ? ((data.won / (data.won + data.lost)) * 100) || 0 : 0
            }))
            .sort((a, b) => b.profit - a.profit)
    }

    const categoryData = getBetsByCategory()

    if (categoryData.length === 0) {
        return null
    }

    const getCategoryIcon = (category) => {
        const icons = {
            'Calcio': '⚽',
            'F1': '🏎️',
            'Tennis': '🎾',
            'Basket': '🏀',
            'MotoGP': '🏍️',
            'NBA': '🏀',
            'NFL': '🏈',
            'Prelievi': '💸',
            'Altro': '🎲'
        }
        return icons[category] || '🎲'
    }

    return (
        <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>🏆 Statistiche per Categoria</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {categoryData.map(cat => (
                    <div key={cat.category} className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>
                                    {getCategoryIcon(cat.category)} {cat.category}
                                </h3>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {cat.total} schedine
                                </div>
                            </div>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: cat.profit >= 0 ? 'var(--success)' : 'var(--danger)'
                            }}>
                                €{cat.profit.toFixed(2)}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                    Win Rate
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)' }}>
                                    {cat.winRate.toFixed(1)}%
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                    W/L
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                                    <span style={{ color: 'var(--success)' }}>{cat.won}</span>
                                    {' / '}
                                    <span style={{ color: 'var(--danger)' }}>{cat.lost}</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div style={{
                            marginTop: '1rem',
                            height: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${cat.winRate}%`,
                                height: '100%',
                                background: 'linear-gradient(to right, var(--success), var(--primary))',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CategoryStats
