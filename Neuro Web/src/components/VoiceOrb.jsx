import React from 'react'

/**
 * VoiceOrb — animated microphone button with visual state feedback.
 * States: idle | listening | processing | speaking
 */
export default function VoiceOrb({ state = 'idle', onClick, size = 64, disabled = false }) {
  const configs = {
    idle: {
      bg: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
      border: 'rgba(99,102,241,0.4)',
      icon: '🎤',
      shadow: 'none',
      pulse: false,
      label: 'Start voice input',
    },
    listening: {
      bg: 'linear-gradient(135deg, #ef4444, #dc2626)',
      border: 'rgba(239,68,68,0.6)',
      icon: '🔴',
      shadow: '0 0 0 0 rgba(239,68,68,0.5)',
      pulse: true,
      label: 'Listening… tap to stop',
    },
    processing: {
      bg: 'linear-gradient(135deg, #6366f1, #a855f7)',
      border: 'rgba(99,102,241,0.6)',
      icon: '⏳',
      shadow: '0 0 24px rgba(99,102,241,0.5)',
      pulse: false,
      label: 'Processing…',
    },
    speaking: {
      bg: 'linear-gradient(135deg, #10b981, #059669)',
      border: 'rgba(16,185,129,0.6)',
      icon: '🔊',
      shadow: '0 0 24px rgba(16,185,129,0.5)',
      pulse: true,
      label: 'Speaking — tap to stop',
    },
  }

  const cfg = configs[state] || configs.idle

  return (
    <button
      aria-label={cfg.label}
      title={cfg.label}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${cfg.border}`,
        background: cfg.bg,
        boxShadow: cfg.shadow,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontSize: size * 0.42,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
        flexShrink: 0,
        animation: cfg.pulse ? 'voice-orb-pulse 1.5s ease-in-out infinite' : 'none',
        outline: 'none',
      }}
    >
      {/* Ripple rings when listening */}
      {state === 'listening' && (
        <>
          <span style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            border: '2px solid rgba(239,68,68,0.35)',
            animation: 'ripple 1.5s ease-out infinite',
          }} />
          <span style={{
            position: 'absolute',
            inset: -16,
            borderRadius: '50%',
            border: '2px solid rgba(239,68,68,0.2)',
            animation: 'ripple 1.5s ease-out infinite 0.4s',
          }} />
        </>
      )}

      {/* Speaking waveform dots */}
      {state === 'speaking' && (
        <div style={{
          position: 'absolute',
          bottom: -18,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 3,
        }}>
          {[0,1,2,3,4].map(i => (
            <span key={i} style={{
              width: 3,
              height: 8 + (i % 3) * 5,
              borderRadius: 2,
              background: 'rgba(16,185,129,0.7)',
              animation: `wave-bar 0.9s ease-in-out infinite`,
              animationDelay: `${i * 0.12}s`,
            }} />
          ))}
        </div>
      )}

      <span style={{ position: 'relative', zIndex: 1 }}>{cfg.icon}</span>
    </button>
  )
}
