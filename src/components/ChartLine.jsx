function ChartLine({ bets }) {
    if (bets.length === 0) return null

    // Calculate cumulative profit over time
    const getChartData = () => {
        // Sort bets by date
        const sortedBets = [...bets]
            .filter(b => b.status !== 'pending')
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

        let cumulativeProfit = 0
        const data = sortedBets.map(bet => {
            const profit = bet.status === 'won'
                ? (bet.stake * bet.odds) - bet.stake
                : -bet.stake

            cumulativeProfit += profit

            return {
                date: new Date(bet.created_at),
                profit: cumulativeProfit,
                bet
            }
        })

        // Add starting point at 0
        if (data.length > 0) {
            const firstDate = new Date(data[0].date)
            firstDate.setDate(firstDate.getDate() - 1)
            data.unshift({ date: firstDate, profit: 0 })
        }

        return data
    }

    const data = getChartData()

    if (data.length === 0) return null

    const maxProfit = Math.max(...data.map(d => d.profit), 0)
    const minProfit = Math.min(...data.map(d => d.profit), 0)
    const range = maxProfit - minProfit || 100
    const chartHeight = 300

    // Generate SVG path
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100
        const y = ((maxProfit - d.profit) / range) * 100
        return `${x},${y}`
    })

    const pathData = `M ${points.join(' L ')}`

    // Generate area path (for gradient fill)
    const areaPoints = [...points]
    const lastPoint = points[points.length - 1].split(',')
    const firstPoint = points[0].split(',')
    areaPoints.push(`${lastPoint[0]},100`)
    areaPoints.push(`${firstPoint[0]},100`)
    const areaPathData = `M ${areaPoints.join(' L ')} Z`

    const currentProfit = data[data.length - 1]?.profit || 0

    return (
        <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>📈 Andamento del Saldo</h2>
                <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: currentProfit >= 0 ? 'var(--success)' : 'var(--danger)'
                }}>
                    {currentProfit >= 0 ? '+' : ''}€{currentProfit.toFixed(2)}
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', position: 'relative' }}>
                <svg
                    viewBox="0 0 100 100"
                    style={{ width: '100%', height: `${chartHeight}px` }}
                    preserveAspectRatio="none"
                >
                    {/* Gradient fill */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: currentProfit >= 0 ? 'var(--success)' : 'var(--danger)', stopOpacity: 0.3 }} />
                            <stop offset="100%" style={{ stopColor: currentProfit >= 0 ? 'var(--success)' : 'var(--danger)', stopOpacity: 0 }} />
                        </linearGradient>
                    </defs>

                    {/* Zero line */}
                    {minProfit < 0 && maxProfit > 0 && (
                        <line
                            x1="0"
                            y1={((maxProfit - 0) / range) * 100}
                            x2="100"
                            y2={((maxProfit - 0) / range) * 100}
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="0.3"
                            strokeDasharray="2,2"
                            vectorEffect="non-scaling-stroke"
                        />
                    )}

                    {/* Area fill */}
                    <path
                        d={areaPathData}
                        fill="url(#chartGradient)"
                    />

                    {/* Line */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={currentProfit >= 0 ? 'var(--success)' : 'var(--danger)'}
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                        style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
                    />

                    {/* Data points */}
                    {data.map((d, i) => {
                        const x = (i / (data.length - 1)) * 100
                        const y = ((maxProfit - d.profit) / range) * 100
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="0.8"
                                fill={d.profit >= 0 ? 'var(--success)' : 'var(--danger)'}
                                vectorEffect="non-scaling-stroke"
                                style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}
                            />
                        )
                    })}
                </svg>

                {/* Labels */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '1rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)'
                }}>
                    <div>
                        {data.length > 0 && data[0].date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                    </div>
                    <div>
                        {data.length > 0 && data[data.length - 1].date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                    </div>
                </div>

                {/* Stats below chart */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.5rem',
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                            Massimo
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--success)' }}>
                            +€{maxProfit.toFixed(2)}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                            Minimo
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--danger)' }}>
                            €{minProfit.toFixed(2)}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                            Variazione
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--primary)' }}>
                            €{range.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChartLine
