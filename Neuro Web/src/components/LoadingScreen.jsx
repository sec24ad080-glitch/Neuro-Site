import React from 'react'

export default function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      gap: '24px'
    }}>
      {/* Animated brain logo */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <div style={{
          width: 80, height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40,
          animation: 'pulse 1.5s ease-in-out infinite',
          boxShadow: '0 0 30px rgba(99,102,241,0.6)'
        }}>
          🧠
        </div>
      </div>
      
      {/* Brand name */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: 32, fontWeight: 800, margin: 0,
          background: 'linear-gradient(to right, #a5b4fc, #f0abfc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>NeuroLite</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontSize: 14 }}>
          AI Learning Assistant
        </p>
      </div>

      {/* Spinner */}
      <div style={{
        width: 40, height: 40,
        border: '3px solid rgba(99,102,241,0.2)',
        borderTop: '3px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
      `}</style>
    </div>
  )
}
