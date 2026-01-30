'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Clean outline icons
const DashboardIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
)

const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
)

// Larger icon for tipster items
const UserIconLarge = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
)

const ChevronDown = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6,9 12,15 18,9" />
    </svg>
)

const ChevronUp = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="18,15 12,9 6,15" />
    </svg>
)

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
)

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="3,6 5,6 21,6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
)

const StatsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
)

const SettingsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
)

export default function Sidebar() {
    const [tipsters, setTipsters] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [tipsterExpanded, setTipsterExpanded] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [newTipsterName, setNewTipsterName] = useState('')
    const [initialBankroll, setInitialBankroll] = useState('')
    const [editingTipster, setEditingTipster] = useState(null)
    const [editName, setEditName] = useState('')
    const pathname = usePathname()

    useEffect(() => {
        fetchTipsters()
        const subscription = supabase
            .channel('tipsters_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tipsters' }, fetchTipsters)
            .subscribe()
        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    const fetchTipsters = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data, error } = await supabase.from('tipsters').select('*').order('name')
        if (!error) setTipsters(data || [])
    }

    const handleAddTipster = async (e) => {
        e.preventDefault()
        if (!newTipsterName || !initialBankroll) return
        const { data: { user } } = await supabase.auth.getUser()
        const { error } = await supabase.from('tipsters').insert([{
            user_id: user.id,
            name: newTipsterName,
            initial_bankroll: parseFloat(initialBankroll)
        }])
        if (error) alert('Errore: ' + error.message)
        else {
            setNewTipsterName('')
            setInitialBankroll('')
            setIsAdding(false)
        }
    }

    const handleDeleteTipster = async (id, name) => {
        if (!confirm(`Eliminare "${name}"?`)) return
        const { error } = await supabase.from('tipsters').delete().eq('id', id)
        if (error) alert('Errore: ' + error.message)
    }

    const startEditing = (tipster) => {
        setEditingTipster(tipster.id)
        setEditName(tipster.name)
    }

    const saveEdit = async (id) => {
        if (!editName) return
        const { error } = await supabase.from('tipsters').update({ name: editName }).eq('id', id)
        if (error) alert('Errore: ' + error.message)
        setEditingTipster(null)
    }

    return (
        <>
            {/* Hamburger Button - Only visible when sidebar closed */}
            {!isOpen && (
                <button className="hamburger-btn" onClick={() => setIsOpen(true)}>
                    <div className="hamburger-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>
            )}

            {/* Overlay */}
            {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}

            {/* Sidebar Panel */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Hamburger inside sidebar to close */}
                <button className="hamburger-inside" onClick={() => setIsOpen(false)}>
                    <div className="hamburger-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>
                <nav className="nav-content">
                    {/* Dashboard */}
                    <Link
                        href="/dashboard"
                        className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`}
                    >
                        <DashboardIcon />
                        <span>Dashboard</span>
                    </Link>

                    {/* Tipster Section - Expandable */}
                    <div className="nav-section">
                        <button
                            className={`nav-item section-toggle ${tipsters.some(t => pathname === `/dashboard/tipster/${t.id}`) ? 'active' : ''}`}
                            onClick={() => setTipsterExpanded(!tipsterExpanded)}
                        >
                            <UserIcon />
                            <span>Tipster</span>
                            <div className="chevron">
                                {tipsterExpanded ? <ChevronUp /> : <ChevronDown />}
                            </div>
                        </button>

                        {tipsterExpanded && (
                            <div className="tipster-items">
                                {tipsters.map(tipster => (
                                    <div
                                        key={tipster.id}
                                        className={`tipster-item ${pathname === `/dashboard/tipster/${tipster.id}` ? 'active' : ''}`}
                                    >
                                        {editingTipster === tipster.id ? (
                                            <div className="edit-row">
                                                <input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="edit-input"
                                                    autoFocus
                                                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(tipster.id)}
                                                />
                                                <button onClick={() => saveEdit(tipster.id)} className="icon-btn save">✓</button>
                                                <button onClick={() => setEditingTipster(null)} className="icon-btn cancel">✕</button>
                                            </div>
                                        ) : (
                                            <>
                                                <Link href={`/dashboard/tipster/${tipster.id}`} className="tipster-link">
                                                    <UserIconLarge />
                                                    <span>{tipster.name}</span>
                                                </Link>
                                                <div className="item-actions">
                                                    <button onClick={() => startEditing(tipster)} className="action-btn"><EditIcon /></button>
                                                    <button onClick={() => handleDeleteTipster(tipster.id, tipster.name)} className="action-btn del"><TrashIcon /></button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}

                                <button className="add-item-btn" onClick={() => setIsAdding(true)}>
                                    <PlusIcon />
                                    <span>Aggiungi Tipster</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Prelievi e Stats */}
                    <Link
                        href="/dashboard/stats"
                        className={`nav-item ${pathname === '/dashboard/stats' ? 'active' : ''}`}
                        style={{ fontSize: '1.1rem', fontWeight: '600' }}
                    >
                        <StatsIcon />
                        <span>Prelievi e Stats</span>
                    </Link>
                </nav>

                {/* Add Modal */}
                {isAdding && (
                    <div className="modal-backdrop" onClick={() => setIsAdding(false)}>
                        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                            <h3>Nuovo Tipster</h3>
                            <form onSubmit={handleAddTipster}>
                                <input
                                    type="text"
                                    placeholder="Nome del tipster"
                                    value={newTipsterName}
                                    onChange={(e) => setNewTipsterName(e.target.value)}
                                    autoFocus
                                />
                                <input
                                    type="number"
                                    placeholder="Bankroll iniziale (€)"
                                    value={initialBankroll}
                                    onChange={(e) => setInitialBankroll(e.target.value)}
                                />
                                <div className="modal-btns">
                                    <button type="submit" className="btn-primary">Crea</button>
                                    <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary">Annulla</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </aside>

            <style jsx>{`
                /* Hamburger */
                .hamburger-btn {
                    position: fixed;
                    top: 18px;
                    left: 18px;
                    z-index: 1001;
                    width: 44px;
                    height: 44px;
                    background: #1e2235;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .hamburger-btn:hover {
                    background: #252a40;
                    border-color: rgba(255,255,255,0.15);
                }
                .hamburger-icon {
                    width: 20px;
                    height: 14px;
                    position: relative;
                }
                .hamburger-icon span {
                    display: block;
                    position: absolute;
                    width: 100%;
                    height: 2px;
                    background: #a0aec0;
                    border-radius: 2px;
                    transition: all 0.3s;
                }
                .hamburger-icon span:nth-child(1) { top: 0; }
                .hamburger-icon span:nth-child(2) { top: 6px; }
                .hamburger-icon span:nth-child(3) { top: 12px; }

                .hamburger-inside {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 12px 16px;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                }

                /* Overlay */
                .sidebar-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 998;
                }

                /* Sidebar */
                .sidebar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 260px;
                    height: 100vh;
                    background: #11141f;
                    z-index: 999;
                    transform: translateX(-100%);
                    transition: transform 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }
                .sidebar.open {
                    transform: translateX(0);
                }

                /* Navigation */
                .nav-content {
                    padding: 24px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 12px 16px;
                    border-radius: 8px;
                    color: #8b95a5;
                    text-decoration: none;
                    font-size: 15px;
                    font-weight: 500;
                    transition: all 0.15s;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    width: 100%;
                    text-align: left;
                }
                .nav-item:hover {
                    color: #ffffff;
                    background: rgba(255,255,255,0.05);
                }
                .nav-item.active {
                    color: #ffffff;
                    background: rgba(255,255,255,0.08);
                }

                .section-toggle {
                    position: relative;
                }
                .chevron {
                    margin-left: auto;
                    opacity: 0.6;
                    transition: transform 0.2s;
                }

                /* Tipster Items - Same style as main nav */
                .tipster-items {
                    display: flex;
                    flex-direction: column;
                    margin-left: 20px;
                    padding-left: 20px;
                    border-left: 1px solid rgba(255,255,255,0.08);
                    margin-top: 8px;
                    gap: 4px;
                }
                .tipster-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    border-radius: 8px;
                    color: #ffffff;
                    transition: all 0.15s;
                }
                .tipster-item:hover {
                    color: #ffffff;
                    background: rgba(255,255,255,0.05);
                }
                .tipster-item.active {
                    color: #ffffff;
                    background: rgba(255,255,255,0.08);
                }
                .tipster-link {
                    flex: 1;
                    text-decoration: none !important;
                    color: #ffffff !important;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    font-size: 16px;
                    font-weight: 500;
                    letter-spacing: 0.3px;
                }
                .tipster-link:hover,
                .tipster-link:visited,
                .tipster-link:active {
                    color: #ffffff !important;
                    text-decoration: none !important;
                }
                .tipster-item.active .tipster-link {
                    font-weight: 600;
                }

                .item-actions {
                    display: flex;
                    gap: 4px;
                    opacity: 0;
                    transition: opacity 0.15s;
                }
                .tipster-item:hover .item-actions {
                    opacity: 1;
                }
                .action-btn {
                    background: transparent;
                    border: none;
                    color: #6b7785;
                    padding: 4px;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                }
                .action-btn:hover {
                    color: #ffffff;
                    background: rgba(255,255,255,0.1);
                }
                .action-btn.del:hover {
                    color: #f87171;
                }

                .add-item-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    color: #6b7785;
                    font-size: 13px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    transition: all 0.15s;
                    border-radius: 6px;
                }
                .add-item-btn:hover {
                    color: #ffffff;
                    background: rgba(255,255,255,0.04);
                }

                /* Edit Mode */
                .edit-row {
                    display: flex;
                    gap: 6px;
                    width: 100%;
                    align-items: center;
                }
                .edit-input {
                    flex: 1;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.15);
                    color: white;
                    padding: 6px 10px;
                    border-radius: 6px;
                    font-size: 13px;
                }
                .icon-btn {
                    background: transparent;
                    border: none;
                    font-size: 14px;
                    cursor: pointer;
                    padding: 4px 6px;
                }
                .icon-btn.save { color: #4ade80; }
                .icon-btn.cancel { color: #f87171; }

                /* Modal */
                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.75);
                    z-index: 1100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .modal-box {
                    background: #1a1f30;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px;
                    padding: 28px;
                    width: 90%;
                    max-width: 360px;
                }
                .modal-box h3 {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: #ffffff;
                }
                .modal-box input {
                    width: 100%;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 12px 14px;
                    border-radius: 8px;
                    font-size: 14px;
                    margin-bottom: 12px;
                }
                .modal-box input:focus {
                    outline: none;
                    border-color: rgba(255,255,255,0.25);
                }
                .modal-box input::placeholder {
                    color: #6b7785;
                }
                .modal-btns {
                    display: flex;
                    gap: 10px;
                    margin-top: 8px;
                }
                .btn-primary, .btn-secondary {
                    flex: 1;
                    padding: 12px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-primary {
                    background: #3b82f6;
                    color: white;
                }
                .btn-primary:hover {
                    background: #2563eb;
                }
                .btn-secondary {
                    background: rgba(255,255,255,0.08);
                    color: #8b95a5;
                }
                .btn-secondary:hover {
                    background: rgba(255,255,255,0.12);
                    color: white;
                }
            `}</style>
        </>
    )
}
