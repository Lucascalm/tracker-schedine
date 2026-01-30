'use client';

import React, { useState } from 'react';
import { Sparkles, RefreshCcw, AlertTriangle, Loader2 } from 'lucide-react';
import { summarizeChartData } from '@/lib/ai-utils';

interface AIInsightCardProps {
    data: any[];
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ data }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [completion, setCompletion] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleAnalyze = async () => {
        try {
            setIsLoading(true);
            setErrorMsg(null);
            setCompletion(null);

            const context = summarizeChartData(data);

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context })
            });

            if (!response.ok && response.status !== 200) {
                throw new Error(`HTTP ${response.status}`);
            }

            // Read the response as text (handles both streaming and plain text)
            const text = await response.text();
            setCompletion(text || 'Nessuna risposta ricevuta.');

        } catch (e: any) {
            console.error('AI Fetch Error:', e);
            setErrorMsg("Errore nell'analisi. Riprova più tardi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-card p-6 mt-6 relative overflow-hidden transition-all duration-500 border border-indigo-500/20">

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">AI Risk Analyst</h3>
                    </div>
                </div>

                {!completion && !isLoading && (
                    <button
                        onClick={handleAnalyze}
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        Genera Analisi
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="flex items-center gap-3 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analisi in corso...</span>
                </div>
            )}

            {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {errorMsg}
                </div>
            )}

            {completion && (
                <div className="prose prose-invert max-w-none">
                    <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line font-medium">
                        {completion}
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleAnalyze}
                            className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
                        >
                            <RefreshCcw className="w-3 h-3" />
                            Rigenera
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

