import React, { useState } from 'react';
import { Calendar, CheckCircle2, XCircle, AlertCircle, Clock, Edit2, Trash2, Save, X, MoreHorizontal } from 'lucide-react';

interface Bet {
    id: string;
    created_at: string;
    description?: string;
    stake: number;
    odds: number;
    status: 'Won' | 'Lost' | 'Void' | 'Pending';
    category?: string;
    notes?: string;
}

interface BetHistoryTableProps {
    bets: Bet[];
    onUpdateBet?: (id: string, updates: Partial<Bet>) => void;
    onDeleteBet?: (id: string) => void;
}

export function BetHistoryTable({ bets, onUpdateBet, onDeleteBet }: BetHistoryTableProps) {
    // Sort by date desc
    const sortedBets = [...bets].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Bet>>({});

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'won' || s === 'vinta') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        if (s === 'lost' || s === 'persa') return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
        if (s === 'void' || s === 'nulla') return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    };

    const getStatusIcon = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'won' || s === 'vinta') return <CheckCircle2 className="w-4 h-4" />;
        if (s === 'lost' || s === 'persa') return <XCircle className="w-4 h-4" />;
        if (s === 'void' || s === 'nulla') return <AlertCircle className="w-4 h-4" />;
        return <Clock className="w-4 h-4" />;
    };

    const startEditing = (bet: Bet) => {
        setEditingId(bet.id);
        setEditForm({
            created_at: bet.created_at,
            description: bet.description,
            category: bet.category,
            odds: bet.odds,
            stake: bet.stake,
            status: bet.status
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = () => {
        if (onUpdateBet && editingId) {
            onUpdateBet(editingId, editForm);
            setEditingId(null);
        }
    };

    const handleDelete = (id: string) => {
        if (onDeleteBet) {
            onDeleteBet(id);
        }
    };

    // Format date for input datetime-local
    const formatDateForInput = (isoString: string) => {
        try {
            return new Date(isoString).toISOString().slice(0, 16);
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="glass-card p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                    <Calendar className="w-5 h-5 text-primary" />
                    Storico Schedine
                </h3>
                <span className="text-sm text-gray-400">Ultimi {bets.length} risultati</span>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-400 text-xs uppercase border-b border-white/5">
                            <th className="py-4 font-semibold w-32">Data</th>
                            <th className="py-4 font-semibold">Evento / Descrizione</th>
                            <th className="py-4 font-semibold w-28">Cat</th>
                            <th className="py-4 font-semibold w-24 text-center">Quota</th>
                            <th className="py-4 font-semibold w-24 text-right">Stake</th>
                            <th className="py-4 font-semibold w-32 text-center">Esito</th>
                            <th className="py-4 font-semibold w-24 text-right">Profitto</th>
                            <th className="py-4 font-semibold w-16 text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {sortedBets.map((bet) => {
                            const isEditing = editingId === bet.id;
                            const isWin = bet.status?.toLowerCase() === 'won' || bet.status?.toLowerCase() === 'vinta';
                            const isVoid = bet.status?.toLowerCase() === 'void' || bet.status?.toLowerCase() === 'nulla';
                            const isLoss = bet.status?.toLowerCase() === 'lost' || bet.status?.toLowerCase() === 'persa';

                            let profit = 0;
                            if (isWin) profit = (Number(bet.stake) * Number(bet.odds)) - Number(bet.stake);
                            else if (isLoss) profit = -Number(bet.stake);

                            const profitClass = isVoid ? 'text-gray-400' : (profit > 0 ? 'text-emerald-400' : (profit < 0 ? 'text-rose-400' : 'text-gray-400'));
                            const profitSign = profit > 0 ? '+' : '';

                            if (isEditing) {
                                return (
                                    <tr key={bet.id} className="border-b border-white/5 bg-white/5">
                                        <td className="py-4 pr-2">
                                            <input
                                                type="datetime-local"
                                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                                value={formatDateForInput(editForm.created_at || '')}
                                                onChange={e => setEditForm({ ...editForm, created_at: new Date(e.target.value).toISOString() })}
                                            />
                                        </td>
                                        <td className="py-4 pr-2">
                                            <input
                                                type="text"
                                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white"
                                                value={editForm.description || ''}
                                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                            />
                                        </td>
                                        <td className="py-4 pr-2">
                                            <select
                                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white appearance-none"
                                                value={editForm.category || 'Calcio'}
                                                onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                            >
                                                <option value="Calcio">Calcio</option>
                                                <option value="Tennis">Tennis</option>
                                                <option value="Basket">Basket</option>
                                                <option value="F1">F1</option>
                                                <option value="MotoGP">MotoGP</option>
                                                <option value="NBA">NBA</option>
                                                <option value="NFL">NFL</option>
                                                <option value="Altro">Altro</option>
                                            </select>
                                        </td>
                                        <td className="py-4 pr-2">
                                            <input
                                                type="number" step="0.01"
                                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white text-center"
                                                value={editForm.odds}
                                                onChange={e => setEditForm({ ...editForm, odds: parseFloat(e.target.value) })}
                                            />
                                        </td>
                                        <td className="py-4 pr-2">
                                            <input
                                                type="number" step="0.01"
                                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white text-right"
                                                value={editForm.stake}
                                                onChange={e => setEditForm({ ...editForm, stake: parseFloat(e.target.value) })}
                                            />
                                        </td>
                                        <td className="py-4 pr-2">
                                            <select
                                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white appearance-none text-center"
                                                value={editForm.status || 'Pending'}
                                                onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                                            >
                                                <option value="won">Won</option>
                                                <option value="lost">Lost</option>
                                                <option value="void">Void</option>
                                                <option value="pending">Pending</option>
                                            </select>
                                        </td>
                                        <td className="py-4 text-right text-gray-500 text-xs">
                                            -
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={saveEdit} className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button onClick={cancelEditing} className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            }

                            return (
                                <tr key={bet.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <td className="py-4 text-gray-400 font-mono text-xs">
                                        {new Date(bet.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="py-4 font-medium text-white max-w-xs truncate" title={bet.description}>
                                        {bet.description || 'Nessuna descrizione'}
                                    </td>
                                    <td className="py-4 text-gray-400 text-xs">
                                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5">
                                            {bet.category || 'Generale'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-center font-mono text-white/80">@{Number(bet.odds).toFixed(2)}</td>
                                    <td className="py-4 text-right font-mono text-white">€{Number(bet.stake).toFixed(2)}</td>
                                    <td className="py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(bet.status)}`}>
                                            {getStatusIcon(bet.status)}
                                            {bet.status}
                                        </span>
                                    </td>
                                    <td className={`py-4 text-right font-bold font-mono ${profitClass}`}>
                                        {profitSign}€{profit.toFixed(2)}
                                    </td>
                                    <td className="py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEditing(bet)}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-primary transition-colors"
                                                title="Modifica"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bet.id)}
                                                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition-colors"
                                                title="Elimina"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {bets.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-8 text-center text-gray-500 italic">
                                    Nessuna schedina trovata.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
