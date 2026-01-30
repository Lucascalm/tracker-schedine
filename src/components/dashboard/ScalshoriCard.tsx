'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TrendingUp, Wallet, RefreshCcw, Undo2, Settings } from 'lucide-react'

interface ScalshoriCardProps {
    tipster: {
        id: string
        name: string
        initial_bankroll: number
        playing_base: number | null
        total_withdrawals: number
        use_scalshori_method: boolean | null
    }
    currentBankroll: number
    onUpdate: () => void
}

export const ScalshoriCard: React.FC<ScalshoriCardProps> = ({ tipster, currentBankroll, onUpdate }) => {
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [lastOperation, setLastOperation] = useState<any>(null)

    // Calculate values
    const playingBase = tipster.playing_base || tipster.initial_bankroll
    const margin = currentBankroll - playingBase
    const hasPositiveMargin = margin > 0

    // Scalshori percentages
    const withdrawalPercent = 0.25
    const baseIncreasePercent = 0.15

    const withdrawalAmount = hasPositiveMargin ? margin * withdrawalPercent : 0
    const baseIncreaseAmount = hasPositiveMargin ? margin * baseIncreasePercent : 0
    const newBankroll = currentBankroll - withdrawalAmount - baseIncreaseAmount
    const newPlayingBase = playingBase + baseIncreaseAmount

    const handleApplyScalshori = async () => {
        if (!hasPositiveMargin) return
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            // 1. Log the operation for undo capability - generate UUID client-side
            const operationId = crypto.randomUUID()
            const { data: opData, error: opError } = await supabase.from('scalshori_operations').insert([{
                id: operationId,
                tipster_id: tipster.id,
                user_id: user.id,
                margin_before: margin,
                withdrawal_amount: withdrawalAmount,
                base_increase: baseIncreaseAmount,
                bankroll_before: currentBankroll,
                base_gioco_before: playingBase
            }]).select().single()

            if (opError) throw opError

            // 2. Update tipster with new playing_base
            const { error: tipsterError } = await supabase.from('tipsters').update({
                playing_base: newPlayingBase,
                total_withdrawals: (tipster.total_withdrawals || 0) + withdrawalAmount,
                last_scalshori_update: new Date().toISOString()
            }).eq('id', tipster.id)

            if (tipsterError) throw tipsterError

            // 3. Log the withdrawal
            await supabase.from('withdrawals').insert([{
                tipster_id: tipster.id,
                user_id: user.id,
                amount: withdrawalAmount,
                is_scalshori: true
            }])

            setLastOperation(opData)
            setShowConfirm(false)
            onUpdate()

            alert(`✅ Scalshori applicato!\n\nPrelievo: €${withdrawalAmount.toFixed(2)}\nNuova Base: €${newPlayingBase.toFixed(2)}`)

        } catch (error: any) {
            alert('Errore: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleUndo = async () => {
        if (!lastOperation) return
        setLoading(true)

        try {
            // 1. Restore tipster values
            const { error: tipsterError } = await supabase.from('tipsters').update({
                playing_base: lastOperation.base_gioco_before,
                total_withdrawals: (tipster.total_withdrawals || 0) - lastOperation.withdrawal_amount
            }).eq('id', tipster.id)

            if (tipsterError) throw tipsterError

            // 2. Mark operation as cancelled
            await supabase.from('scalshori_operations').update({ cancelled: true }).eq('id', lastOperation.id)

            // 3. Remove the withdrawal entry
            await supabase.from('withdrawals').delete()
                .eq('tipster_id', tipster.id)
                .eq('amount', lastOperation.withdrawal_amount)
                .eq('is_scalshori', true)
                .order('created_at', { ascending: false })
                .limit(1)

            setLastOperation(null)
            onUpdate()

            alert('✅ Operazione annullata!')

        } catch (error: any) {
            alert('Errore annullamento: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleScalshoriMethod = async () => {
        const { error } = await supabase.from('tipsters').update({
            use_scalshori_method: !tipster.use_scalshori_method
        }).eq('id', tipster.id)

        if (!error) onUpdate()
    }

    // If method is disabled, show activation button
    if (!tipster.use_scalshori_method) {
        return (
            <div className="glass-card p-6 border border-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-400" />
                            Metodo Scalshori
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Sistema automatico di gestione margine (25% prelievo, 15% base)
                        </p>
                    </div>
                    <button
                        onClick={toggleScalshoriMethod}
                        className="px-4 py-2 bg-primary/20 border border-primary/50 text-primary rounded-lg hover:bg-primary/30 transition-colors font-medium"
                    >
                        Attiva
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="glass-card p-4 md:p-6 border-l-4 border-indigo-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <RefreshCcw className="w-5 h-5 text-indigo-400" />
                    Metodo Scalshori
                </h3>
                <button
                    onClick={toggleScalshoriMethod}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                    Disattiva
                </button>
            </div>

            {/* Current State - Stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-surface rounded-xl p-3 md:p-4 border border-white/5">
                    <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Bankroll Attuale</p>
                    <p className="text-lg md:text-xl font-bold text-white">€{currentBankroll.toFixed(2)}</p>
                </div>
                <div className="bg-surface rounded-xl p-3 md:p-4 border border-white/5">
                    <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Base Gioco</p>
                    <p className="text-lg md:text-xl font-bold text-white">€{playingBase.toFixed(2)}</p>
                </div>
                <div className="bg-surface rounded-xl p-3 md:p-4 border border-white/5">
                    <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Margine</p>
                    <p className={`text-lg md:text-xl font-bold ${margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {margin >= 0 ? '+' : ''}€{margin.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Preview */}
            {hasPositiveMargin && !showConfirm && (
                <div className="bg-indigo-500/10 rounded-xl p-4 mb-4 border border-indigo-500/20">
                    <p className="text-sm text-indigo-300 mb-3 font-medium">Preview Aggiornamento:</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-emerald-400" />
                            {/* 25% → Prelievi: */}
                            <span className="text-gray-300">Prelievi:</span>
                            <span className="text-emerald-400 font-bold">€{withdrawalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-indigo-400" />
                            {/* 15% → Base Gioco: */}
                            <span className="text-gray-300">Base Gioco:</span>
                            <span className="text-indigo-400 font-bold">+€{baseIncreaseAmount.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400">
                        Dopo: Bankroll €{newBankroll.toFixed(2)} | Base €{newPlayingBase.toFixed(2)}
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            {showConfirm && (
                <div className="bg-rose-500/10 rounded-xl p-4 mb-4 border border-rose-500/30">
                    <p className="text-rose-300 font-medium mb-2">Confermi l'applicazione?</p>
                    <p className="text-sm text-gray-400 mb-4">
                        Prelievo €{withdrawalAmount.toFixed(2)} | +Base €{baseIncreaseAmount.toFixed(2)}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleApplyScalshori}
                            disabled={loading}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? '...' : '✓ Conferma'}
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                        >
                            Annulla
                        </button>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
                {hasPositiveMargin && !showConfirm && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                    >
                        <RefreshCcw className="w-5 h-5" />
                        Applica Scalshori
                    </button>
                )}

                {!hasPositiveMargin && (
                    <div className="flex-1 px-4 py-3 bg-white/5 text-gray-400 rounded-xl text-center">
                        Nessun margine disponibile (margine: €{margin.toFixed(2)})
                    </div>
                )}

                {lastOperation && (
                    <button
                        onClick={handleUndo}
                        disabled={loading}
                        className="px-4 py-3 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2"
                    >
                        <Undo2 className="w-4 h-4" />
                        Annulla Ultimo
                    </button>
                )}
            </div>
        </div>
    )
}
