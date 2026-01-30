'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

function BetList({ bets, onUpdateStatus, onDelete, onUpdateCategory, onUpdateBet }) {
  const [editingBet, setEditingBet] = useState(null)
  const [editStake, setEditStake] = useState('')
  const [editOdds, setEditOdds] = useState('')
  const [editDate, setEditDate] = useState('')
  const [tipsters, setTipsters] = useState([])

  useEffect(() => {
    fetchTipsters()
  }, [])

  const fetchTipsters = async () => {
    const { data } = await supabase.from('tipsters').select('id, name').order('name')
    if (data) setTipsters(data)
  }

  const handleTipsterChange = async (betId, newTipsterId) => {
    await onUpdateBet(betId, { tipster_id: newTipsterId || null })
  }

  if (bets.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎲</div>
        <p>Nessuna schedina ancora. Aggiungine una!</p>
      </div>
    )
  }

  const formatDate = (dateString) => {
    // Force date object from string to avoid timezone shifts if ISO has time
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatPotentialWin = (stake, odds) => {
    return (stake * odds).toFixed(2)
  }

  const startEditing = (bet) => {
    setEditingBet(bet.id)
    setEditStake(bet.stake.toString())
    setEditOdds(bet.odds.toString())
    // Convert ISO date to YYYY-MM-DD for input
    try {
      const date = new Date(bet.created_at)
      setEditDate(date.toISOString().split('T')[0])
    } catch (e) {
      setEditDate('')
    }
  }

  const cancelEditing = () => {
    setEditingBet(null)
    setEditStake('')
    setEditOdds('')
    setEditDate('')
  }

  const saveEditing = async (betId) => {
    const newStake = parseFloat(editStake)
    const newOdds = parseFloat(editOdds)

    if (isNaN(newStake) || isNaN(newOdds) || newStake <= 0 || newOdds <= 0) {
      alert('Inserisci valori validi per importo e quota!')
      return
    }

    if (!editDate) {
      alert('Inserisci una data valida!')
      return
    }

    // Create ISO string from date input (preserving current time if possible, or defaulting to noon)
    const newDate = new Date(editDate)
    // Add current time or keep it simple
    const isoDate = newDate.toISOString()

    await onUpdateBet(betId, {
      stake: newStake,
      odds: newOdds,
      created_at: isoDate
    })
    cancelEditing()
  }

  return (
    <div className="bet-list">
      {bets.map((bet) => (
        <div key={bet.id} className="glass-panel bet-item">
          <div className="bet-info">
            <h3>{bet.description}</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
              {editingBet === bet.id ? (
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="glass-input"
                  style={{ padding: '2px 5px', fontSize: '0.8rem' }}
                />
              ) : (
                <div
                  className="bet-date"
                  onClick={() => startEditing(bet)}
                  style={{ cursor: 'pointer' }}
                  title="Clicca per modificare"
                >
                  📅 {formatDate(bet.created_at)}
                </div>
              )}

              <select
                value={bet.category || 'Altro'}
                onChange={(e) => onUpdateCategory(bet.id, e.target.value)}
                style={{
                  background: 'rgba(0, 242, 255, 0.15)',
                  color: 'var(--primary)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  border: '1px solid rgba(0, 242, 255, 0.3)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 242, 255, 0.25)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 242, 255, 0.15)'
                }}
              >
                {['Calcio', 'F1', 'Tennis', 'Basket', 'MotoGP', 'NBA', 'NFL', 'Altro'].map(cat => (
                  <option key={cat} value={cat} style={{ background: '#1a1a2e', color: 'white' }}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Tipster Selector */}
              <select
                value={bet.tipster_id || ''}
                onChange={(e) => handleTipsterChange(bet.id, e.target.value)}
                style={{
                  background: 'rgba(236, 72, 153, 0.15)',
                  color: '#ec4899',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="" style={{ background: '#1a1a2e', color: 'white' }}>
                  -- Tipster --
                </option>
                {tipsters.map(t => (
                  <option key={t.id} value={t.id} style={{ background: '#1a1a2e', color: 'white' }}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>


          {editingBet === bet.id ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Importo</label>
                <input
                  type="number"
                  step="0.01"
                  value={editStake}
                  onChange={(e) => setEditStake(e.target.value)}
                  className="glass-input"
                  style={{ padding: '6px 10px', fontSize: '0.9rem', width: '100px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quota</label>
                <input
                  type="number"
                  step="0.01"
                  value={editOdds}
                  onChange={(e) => setEditOdds(e.target.value)}
                  className="glass-input"
                  style={{ padding: '6px 10px', fontSize: '0.9rem', width: '80px' }}
                />
              </div>
            </>
          ) : (
            <>
              <div
                className="bet-amount"
                onClick={() => startEditing(bet)}
                style={{ cursor: 'pointer' }}
                title="Clicca per modificare"
              >
                💵 €{bet.stake.toFixed(2)}
              </div>

              <div
                className="bet-odds"
                onClick={() => startEditing(bet)}
                style={{ cursor: 'pointer' }}
                title="Clicca per modificare"
              >
                ⚡ {bet.odds}x
              </div>
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {editingBet === bet.id ? (
              <>
                <button
                  onClick={() => saveEditing(bet.id)}
                  className="glass-btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    background: 'linear-gradient(135deg, #00ff9d, #00d4ff)'
                  }}
                >
                  💾 Salva
                </button>
                <button
                  onClick={cancelEditing}
                  className="glass-btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    background: 'linear-gradient(135deg, #ff4b4b, #ff0055)'
                  }}
                >
                  ❌ Annulla
                </button>
              </>
            ) : (
              <>
                {bet.status === 'pending' && (
                  <>
                    <button
                      onClick={() => onUpdateStatus(bet.id, 'won')}
                      className="glass-btn"
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        background: 'linear-gradient(135deg, #00ff9d, #00d4ff)'
                      }}
                    >
                      ✅ Vinta
                    </button>
                    <button
                      onClick={() => onUpdateStatus(bet.id, 'lost')}
                      className="glass-btn"
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        background: 'linear-gradient(135deg, #ff4b4b, #ff0055)'
                      }}
                    >
                      ❌ Persa
                    </button>
                  </>
                )}

                {bet.status === 'won' && (
                  <div className="status-badge status-won">
                    🎉 VINTA +€{formatPotentialWin(bet.stake, bet.odds)}
                  </div>
                )}

                {bet.status === 'lost' && (
                  <div className="status-badge status-lost">
                    💔 PERSA -€{bet.stake.toFixed(2)}
                  </div>
                )}

                <button
                  onClick={() => onDelete(bet.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 75, 75, 0.5)',
                    color: 'var(--danger)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 75, 75, 0.1)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default BetList
