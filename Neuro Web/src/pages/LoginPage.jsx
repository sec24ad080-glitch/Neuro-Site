import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

const AVATARS = ['🦊', '🐯', '🦁', '🐼', '🦋', '🐬', '🦄', '🐉', '🦅', '🐸', '🐧', '🦉']

export default function LoginPage() {
  const { profiles, login, createProfile, deleteProfile } = useApp()
  const navigate = useNavigate()
  const [creating, setCreating]     = useState(false)
  const [name, setName]             = useState('')
  const [avatar, setAvatar]         = useState('🦊')
  const [error, setError]           = useState('')

  const handleLogin = (p) => {
    login(p)
    navigate('/dashboard')
  }

  const handleCreate = () => {
    if (!name.trim()) { setError('Please enter your name!'); return }
    if (name.trim().length < 2) { setError('Name must be at least 2 characters.'); return }
    createProfile(name.trim(), avatar)
    navigate('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #0d0d1a 0%, #141432 50%, #0d0d1a 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>

        {/* Logo & title */}
        <div className="text-center animate-fadeInUp" style={{ marginBottom: 36 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24, margin: '0 auto 20px',
            background: 'linear-gradient(135deg,#6366f1,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 42, boxShadow: '0 0 40px rgba(99,102,241,0.5)',
          }} className="animate-float">🧠</div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: 8 }}>Neuro<span className="gradient-text">Lite</span></h1>
          <p style={{ color: 'rgba(241,245,249,0.55)', fontSize: '1rem' }}>
            Learning in Your Own Way ✨
          </p>
          <Link to="/" style={{ display: 'inline-block', marginTop: 10, fontSize: '0.84rem', color: 'var(--indigo-lt)', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</Link>
        </div>

        {/* Card */}
        <div className="glass-card animate-fadeInUp delay-1" style={{ padding: '32px 28px' }}>

          {!creating ? (
            <>
              <h2 style={{ textAlign: 'center', marginBottom: 6, fontSize: '1.3rem' }}>
                Welcome back! 👋
              </h2>
              <p style={{ textAlign: 'center', marginBottom: 24, fontSize: '0.9rem' }}>
                Choose your profile or create a new one
              </p>

              {/* Existing profiles */}
              {profiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {profiles.map((p, i) => (
                    <div key={p.id} className="animate-fadeInUp" style={{ display: 'flex', gap: 8, animationDelay: `${i * 0.06}s` }}>
                      <button
                        onClick={() => handleLogin(p)}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1.5px solid rgba(255,255,255,0.10)',
                          borderRadius: 16,
                          padding: '14px 18px',
                          display: 'flex', alignItems: 'center', gap: 14,
                          cursor: 'pointer',
                          transition: 'all 0.22s ease',
                          flex: 1,
                          textAlign: 'left',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(99,102,241,0.12)'
                          e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'
                          e.currentTarget.style.transform = 'translateX(4px)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'
                          e.currentTarget.style.transform = 'translateX(0)'
                        }}
                      >
                        <div style={{
                          width: 44, height: 44, borderRadius: 14,
                          background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 24, flexShrink: 0
                        }}>{p.avatar}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'rgba(241,245,249,0.45)', marginTop: 2 }}>
                            Level {p.level || 1} · {p.points || 0} pts · {p.badges?.length || 0} badges
                          </div>
                        </div>
                        <span style={{ color: 'rgba(241,245,249,0.3)', fontSize: 18 }}>→</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteProfile(p.id); }}
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1.5px solid rgba(239,68,68,0.2)',
                          borderRadius: 16,
                          padding: '0 16px',
                          color: '#fca5a5',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontSize: 20
                        }}
                        title="Delete Profile"
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(239,68,68,0.2)'
                          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {profiles.length === 0 && (
                <div style={{
                  textAlign: 'center', padding: '20px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 16, marginBottom: 20,
                  border: '1px dashed rgba(255,255,255,0.10)'
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🌟</div>
                  <p style={{ fontSize: '0.88rem' }}>No profiles yet. Create your first one!</p>
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '13px' }}
                onClick={() => setCreating(true)}
              >
                ✨ Create New Profile
              </button>
            </>
          ) : (
            <>
              <h2 style={{ textAlign: 'center', marginBottom: 24, fontSize: '1.3rem' }}>
                Create Your Profile 🌈
              </h2>

              {/* Avatar selection */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(241,245,249,0.7)', marginBottom: 10 }}>
                  Choose Your Avatar
                </label>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8
                }}>
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      style={{
                        background: avatar === a ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                        border: avatar === a ? '2px solid #6366f1' : '1.5px solid rgba(255,255,255,0.08)',
                        borderRadius: 12, padding: '10px 0',
                        fontSize: 24, cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        transform: avatar === a ? 'scale(1.12)' : 'scale(1)',
                        boxShadow: avatar === a ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
                      }}
                    >{a}</button>
                  ))}
                </div>
              </div>

              {/* Name input */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(241,245,249,0.7)', marginBottom: 8 }}>
                  Your Name
                </label>
                <input
                  className="input"
                  placeholder="Enter your name..."
                  value={name}
                  onChange={e => { setName(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  maxLength={30}
                  autoFocus
                />
                {error && (
                  <p style={{ color: '#f87171', fontSize: '0.82rem', marginTop: 6 }}>{error}</p>
                )}
              </div>

              {/* Preview */}
              {name && (
                <div className="animate-scaleIn" style={{
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 14, padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18
                }}>
                  <span style={{ fontSize: 28 }}>{avatar}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(241,245,249,0.4)' }}>Level 1 · Ready to learn! 🚀</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setCreating(false); setError('') }}>
                  ← Back
                </button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleCreate}>
                  🚀 Start Learning!
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center animate-fadeIn delay-3" style={{ marginTop: 20, fontSize: '0.78rem', color: 'rgba(241,245,249,0.3)' }}>
          NeuroLite · Designed for Neurodiverse K-5 Learners
        </p>
      </div>
    </div>
  )
}
