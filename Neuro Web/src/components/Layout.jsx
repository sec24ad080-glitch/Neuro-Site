import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Notification from './Notification.jsx'
import LexWidget from './LexWidget.jsx'

const NAV_ITEMS = [
  { to: '/dashboard', icon: '🏠', label: 'Home', badge: null },
  { to: '/subjects',  icon: '📚', label: 'Subjects', badge: 'K-5' },
  { to: '/chatbot',   icon: '🤖', label: 'AI Tutor', badge: 'AI' },
  { to: '/games',     icon: '🎮', label: 'Games', badge: 'Fun' },
  { to: '/writing',   icon: '✏️', label: 'Writing', badge: null },
  { to: '/parent',    icon: '👨‍👩‍👧', label: 'Parent', badge: null },
  { to: '/settings',  icon: '⚙️', label: 'Settings', badge: null },
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

  // Calculate level progress (e.g. 100 pts per level)
  const currentPoints = currentProfile?.points || 0
  const currentLevel = currentProfile?.level || Math.floor(currentPoints / 100) + 1
  const pointsInCurrentLevel = currentPoints % 100
  const progressPercent = Math.min(Math.max((pointsInCurrentLevel / 100) * 100, 15), 100)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ── Sidebar (desktop) ── */}
      <aside
        style={{
          width: 245,
          background: 'rgba(13, 13, 26, 0.94)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 14px',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          zIndex: 100,
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.35)',
        }}
        className="sidebar-desktop"
      >
        {/* Brand Header */}
        <div style={{ padding: '6px 8px 22px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: '0 0 20px rgba(99,102,241,0.55)',
            flexShrink: 0
          }}>🧠</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.12rem', color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Neuro<span className="gradient-text">Lite</span>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.68rem',
              color: '#34d399',
              fontWeight: 600,
              marginTop: 3,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
              AI Learning Tutor
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: 14,
                textDecoration: 'none',
                color: isActive ? '#ffffff' : 'rgba(241, 245, 249, 0.72)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(168, 85, 247, 0.18))'
                  : 'transparent',
                border: isActive
                  ? '1px solid rgba(99, 102, 241, 0.4)'
                  : '1px solid transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.92rem',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                boxShadow: isActive ? '0 4px 18px rgba(99, 102, 241, 0.2)' : 'none',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: item.badge === 'AI'
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3))'
                      : 'rgba(255,255,255,0.08)',
                    color: item.badge === 'AI' ? '#c084fc' : 'rgba(241,245,249,0.75)',
                    border: item.badge === 'AI' ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Profile Progress & Logout Card */}
        <div
          style={{
            marginTop: 'auto',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
              boxShadow: '0 0 12px rgba(99,102,241,0.35)',
            }}>{currentProfile?.avatar || '🦊'}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentProfile?.name || 'Explorer'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(241,245,249,0.55)', fontWeight: 500 }}>
                Level {currentLevel} · {currentPoints} pts
              </div>
            </div>
          </div>

          {/* Mini XP Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(241,245,249,0.5)', marginBottom: 4 }}>
              <span>Progress</span>
              <span>{pointsInCurrentLevel}/100 XP</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                borderRadius: 999,
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '0.80rem',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
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
      <main style={{ marginLeft: 245, flex: 1, minHeight: '100vh' }} className="main-content">
        <Outlet />
      </main>

      {/* Global Lex Chatbot Widget */}
      <LexWidget />

      {/* Toast notification */}
      {notification && <Notification notification={notification} />}

      <style>{`
        .sidebar-nav-item:hover {
          background: rgba(255, 255, 255, 0.06) !important;
          color: #ffffff !important;
          transform: translateX(3px);
        }
        .sidebar-nav-item.active:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.28), rgba(168, 85, 247, 0.24)) !important;
        }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .mobile-header   { display: flex !important; }
          .main-content    { margin-left: 0 !important; padding-top: 60px; }
        }
      `}</style>
    </div>
  )
}
