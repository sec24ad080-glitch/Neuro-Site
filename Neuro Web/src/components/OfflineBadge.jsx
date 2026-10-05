import React from 'react'

const STATUS_CONFIG = {
  ollama: {
    dot: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.25)',
    label: '● Local AI (Ollama)',
    title: 'Running offline with local AI',
  },
  gemini: {
    dot: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.25)',
    label: '● Google Gemini',
    title: 'Running online with Google Gemini',
  },
  offline: {
    dot: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.25)',
    label: '● Offline Mode',
    title: 'Running offline with basic responses',
  },
}

/**
 * OfflineBadge — shows current AI engine status.
 * @param {'ollama'|'gemini'|'offline'} status
 * @param {string} [model] - e.g. 'gemma2:2b'
 * @param {boolean} [small]
 */
export default function OfflineBadge({ status = 'offline', model, small = false }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.offline
  const label = status === 'ollama' && model
    ? `● Local AI (${model.split(':')[0]})`
    : cfg.label

  return (
    <span
      title={cfg.title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: small ? '3px 8px' : '4px 12px',
        borderRadius: 999,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        fontSize: small ? '0.68rem' : '0.75rem',
        fontWeight: 600,
        color: cfg.dot,
        letterSpacing: '0.02em',
        userSelect: 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: cfg.dot,
        boxShadow: `0 0 6px ${cfg.dot}`,
        animation: status === 'ollama' ? 'pulse-dot 2s ease-in-out infinite' : 'none',
        flexShrink: 0,
      }} />
      {label}
    </span>
  )
}
