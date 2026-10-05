import React from 'react'

const TYPE_STYLES = {
  success: { icon: '🎉', color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
  badge:   { icon: '🏅', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
  error:   { icon: '❌', color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
  info:    { icon: '💡', color: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
}

export default function Notification({ notification }) {
  if (!notification) return null
  const { icon, color, glow } = TYPE_STYLES[notification.type] || TYPE_STYLES.info

  return (
    <div className="toast animate-slideInRight" style={{ borderLeft: `3px solid ${color}`, boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${glow}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0
        }}>{icon}</div>
        <p style={{ color: '#f1f5f9', fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>
          {notification.message}
        </p>
      </div>
    </div>
  )
}
