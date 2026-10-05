import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Notification from './Notification.jsx'
import LexWidget from './LexWidget.jsx'

const NAV_ITEMS = [
  { to: '/dashboard', icon: '🏠', label: 'Home' },
  { to: '/subjects',  icon: '📚', label: 'Subjects' },
  { to: '/chatbot',   icon: '🤖', label: 'AI Tutor' },
  { to: '/games',     icon: '🎮', label: 'Games' },
  { to: '/writing',   icon: '✏️', label: 'Writing' },
  { to: '/parent',    icon: '👨‍👩‍👧', label: 'Parent' },
  { to: '/settings',  icon: '⚙️', label: 'Settings' },
]

export default function Layout() {
  const { currentProfile, logout, notification, setBloomMode } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Update NeuralBloom animation mode based on current page
  useEffect(() => {
    if (!setBloomMode) return
    const path = location.pathname
    if (path.includes('/chatbot')) setBloomMode('voice')
    else if (path.includes('/dashboard')) setBloomMode('progress')
    else if (path.includes('/subjects') || path.includes('/quiz')) setBloomMode('adaptive')
    else setBloomMode('hero')
  }, [location.pathname, setBloomMode])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Sidebar (desktop) ── */}
      <aside style={{
        width: 230,
        background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        backdropFilter: 'blur(20px)',
        zIndex: 100,
        gap: 4,
      }} className="sidebar-desktop">

        {/* Brand */}
        <div style={{ padding: '10px 10px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg,#6366f1,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 0 16px rgba(99,102,241,0.5)',
            flexShrink: 0
          }}>🧠</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f1f5f9' }}>NeuroLite</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(241,245,249,0.4)' }}>AI Tutor</div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Profile + logout */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: 14,
          display: 'flex', flexDirection: 'column', gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366f1,#a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0
            }}>{currentProfile?.avatar || '🦊'}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentProfile?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(241,245,249,0.4)' }}>
                Lv {currentProfile?.level || 1} · {currentProfile?.points || 0} pts
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ width: '100%' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <header style={{
        display: 'none',
        position: 'fixed', top: 0, left: 0, right: 0, height: 60, zIndex: 200,
        background: 'rgba(13,13,26,0.92)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        padding: '0 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
      }} className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🧠</span>
          <span style={{ fontWeight: 800, fontSize: '1rem' }}>NeuroLite</span>
        </div>
        <button
          className="btn btn-secondary btn-icon"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 190,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setMenuOpen(false)}>
          <div style={{
            position: 'absolute', top: 60, left: 0, bottom: 0, width: 240,
            background: '#0d0d1a',
            borderRight: '1px solid rgba(255,255,255,0.07)',
            padding: 16,
            display: 'flex', flexDirection: 'column', gap: 4,
          }} onClick={e => e.stopPropagation()}>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ width: '100%' }}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main style={{ marginLeft: 230, flex: 1, minHeight: '100vh' }} className="main-content">
        <Outlet />
      </main>

      {/* Global Lex Chatbot Widget */}
      <LexWidget />

      {/* Toast notification */}
      {notification && <Notification notification={notification} />}

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .mobile-header   { display: flex !important; }
          .main-content    { margin-left: 0 !important; padding-top: 60px; }
        }
      `}</style>
    </div>
  )
}
