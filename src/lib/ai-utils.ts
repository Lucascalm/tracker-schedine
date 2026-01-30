/**
 * Utility to compress/summarize chart data for LLM consumption.
 * Reduces token usage by calculating aggregates client-side.
 */

interface DataPoint {
    date: string;
    value: number;
}

interface ChartSummary {
    period: string;
    startBalance: number;
    endBalance: number;
    netProfit: number;
    growthPercentage: string;
    maxBalance: number;
    minBalance: number;
    maxDrawdown: string;
    trendSample: string; // Simplified trend for tokens
}

/**
 * Transforms raw chart data into a concise text summary for the AI.
 * @param data Array of { date, value }
 * @returns Compressed string summary
 */
export function summarizeChartData(data: DataPoint[]): string {
    if (!data || data.length === 0) return "No data available.";

    const values = data.map(d => d.value);
    const start = values[0];
    const end = values[values.length - 1];
    const max = Math.max(...values);
    const min = Math.min(...values);

    // Calculate Max Drawdown (Largest drop from a peak)
    let maxDrawdown = 0;
    let peak = values[0];

    for (const val of values) {
        if (val > peak) peak = val;
        const drawdown = (peak - val) / peak;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    // Sample trend (First, Middle, Last points + any major spikes)
    // To save tokens, we just take 5 equidistant points
    const sampleIndices = [
        0,
        Math.floor(data.length * 0.25),
        Math.floor(data.length * 0.5),
        Math.floor(data.length * 0.75),
        data.length - 1
    ];

    // Dedup indices just in case data is short
    const uniqueIndices = Array.from(new Set(sampleIndices)).sort((a, b) => a - b);

    const trendString = uniqueIndices
        .map(i => `[Day ${i + 1}: €${data[i].value}]`)
        .join(" -> ");

    const summary = `
    ANALYSIS CONTEXT:
    - Start Balance: €${start}
    - End Balance: €${end}
    - Net Result: ${end - start >= 0 ? '+' : ''}€${(end - start).toFixed(2)}
    - Growth: ${(((end - start) / start) * 100).toFixed(1)}%
    - Range: Min €${min} / Max €${max}
    - Max Drawdown: ${(maxDrawdown * 100).toFixed(1)}% (Risk Metric)
    - Trend Flow: ${trendString}
  `.trim();

    return summary;
}
