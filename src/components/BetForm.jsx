'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

function BetForm({ onAddBet, currentTipster = null }) {
    const [description, setDescription] = useState('')
    const [stake, setStake] = useState('')
    const [odds, setOdds] = useState('')
    const [category, setCategory] = useState('Calcio')

    // Tipster specific states
    const [selectedTipsterId, setSelectedTipsterId] = useState(currentTipster?.id || '')
    const [stakePercentage, setStakePercentage] = useState('')
    const [tipsters, setTipsters] = useState([])
    const [bankroll, setBankroll] = useState(currentTipster?.initial_bankroll || 0)

    const categories = ['Calcio', 'F1', 'Tennis', 'Basket', 'MotoGP', 'NBA', 'NFL', 'Prelievi', 'Altro']

    useEffect(() => {
        // If we are not on a specific tipster page, fetch all tipsters for dropdown
        if (!currentTipster) {
            fetchTipsters()
        } else {
            // If on a specific tipster page, lock the selection
            setBankroll(currentTipster.initial_bankroll)
            setSelectedTipsterId(currentTipster.id)
        }
    }, [currentTipster])

    // Calculate stake from percentage
    const handlePercentageChange = (value) => {
        setStakePercentage(value)
        if (value && bankroll > 0) {
            const calculatedStake = (parseFloat(bankroll) * parseFloat(value)) / 100
            setStake(calculatedStake.toFixed(2))
        }
    }

    const fetchTipsters = async () => {
        const { data, error } = await supabase
            .from('tipsters')
            .select('*')
            .order('name')
        if (data) setTipsters(data)
    }

    const handleTipsterChange = (e) => {
        const id = e.target.value
        setSelectedTipsterId(id)
        if (id) {
            const t = tipsters.find(t => t.id === id)
            if (t) setBankroll(t.initial_bankroll)
        } else {
            setBankroll(0)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!description || !stake || !odds || !category) {
            alert('Compila tutti i campi!')
            return
        }

        const betData = {
            description,
            stake: parseFloat(stake),
            odds: parseFloat(odds),
            category,
            tipster_id: selectedTipsterId || null,
            stake_percentage: stakePercentage ? parseFloat(stakePercentage) : null
        }

        await onAddBet(betData)

        // Reset form
        setDescription('')
        setStake('')
        setOdds('')
        setStakePercentage('') // Reset percentage
        if (!currentTipster) {
            // Only reset tipster selection if we are on global dashboard
            setSelectedTipsterId('')
            setBankroll(0)
        }
        setCategory('Calcio')
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Description & Category */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Descrizione</label>
                    <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans"
                        placeholder="Es. Inter vs Milan - Over 2.5"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-1/3">
                    <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Categoria</label>
                    <select
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat} className="bg-[#1a1f30]">{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Row 2: Stats Inputs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">

                {/* Tipster Select (if global) */}
                {!currentTipster && (
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Tipster</label>
                        <select
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                            value={selectedTipsterId}
                            onChange={handleTipsterChange}
                        >
                            <option value="" className="bg-[#1a1f30]">-- Nessuno --</option>
                            {tipsters.map(t => (
                                <option key={t.id} value={t.id} className="bg-[#1a1f30]">{t.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Bankroll % */}
                {(selectedTipsterId || currentTipster) && (
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Stake %</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                                placeholder="1.0"
                                value={stakePercentage}
                                onChange={(e) => handlePercentageChange(e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                        </div>
                    </div>
                )}

                {/* Amount */}
                <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Importo (€)</label>
                    <input
                        type="number"
                        step="0.01"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono font-bold"
                        placeholder="0.00"
                        value={stake}
                        onChange={(e) => {
                            const newStake = e.target.value
                            setStake(newStake)
                            if (newStake && bankroll > 0) {
                                const pct = (parseFloat(newStake) / parseFloat(bankroll)) * 100
                                setStakePercentage(pct.toFixed(1))
                            }
                        }}
                    />
                </div>

                {/* Odds */}
                <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Quota</label>
                    <input
                        type="number"
                        step="0.01"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                        placeholder="1.80"
                        value={odds}
                        onChange={(e) => setOdds(e.target.value)}
                    />
                </div>

                {/* Submit Button */}
                <div className="col-span-2 md:col-span-1">
                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3 px-4 rounded-lg transition-all transform active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        <span>+ Aggiungi</span>
                    </button>
                </div>
            </div>
        </form>
    )
}

export default BetForm
