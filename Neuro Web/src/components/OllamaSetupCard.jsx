import React, { useState } from 'react'
import { checkOllamaStatus, OLLAMA_BASE, DEFAULT_MODEL } from '../services/localLLM.js'

/**
 * OllamaSetupCard — shown when Ollama is not running.
 * Provides step-by-step instructions and a "Check Again" button.
 * NEVER calls any cloud API.
 */
export default function OllamaSetupCard({ onCheckAgain, suggestedModel = DEFAULT_MODEL }) {
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState(null)

  const handleCheck = async () => {
    setChecking(true)
    setCheckResult(null)
    const status = await checkOllamaStatus()
    setChecking(false)
    if (status.running) {
      onCheckAgain?.(status)
    } else {
      setCheckResult('still-offline')
    }
  }

  return (
    <div style={{
      margin: '16px 24px',
      padding: '20px 24px',
      borderRadius: 16,
      background: 'rgba(245,158,11,0.08)',
      border: '1px solid rgba(245,158,11,0.25)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 22 }}>🤖</span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: '#fbbf24', fontSize: '0.95rem' }}>
            Local AI Not Running
          </p>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(241,245,249,0.55)', marginTop: 2 }}>
            Ollama ({OLLAMA_BASE}) is not reachable — no cloud API will be used
          </p>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Step number={1} title="Install Ollama">
          <span>Download from </span>
          <a
            href="https://ollama.com/download"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#818cf8', textDecoration: 'underline' }}
          >
            ollama.com/download
          </a>
          <span> (Windows/Mac/Linux)</span>
        </Step>

        <Step number={2} title="Download the AI model">
          <span>Open a terminal and run:</span>
          <code style={codeStyle}>ollama pull {suggestedModel}</code>
          <span style={{ fontSize: '0.75rem', color: 'rgba(241,245,249,0.45)' }}>
            (~1.6 GB — only needed once)
          </span>
        </Step>

        <Step number={3} title="Start Ollama">
          <span>Ollama starts automatically. Or run:</span>
          <code style={codeStyle}>ollama serve</code>
        </Step>

        <Step number={4} title="Come back here">
          <span>Click the button below to reconnect!</span>
        </Step>
      </div>

      {/* Check Again button */}
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={handleCheck}
          disabled={checking}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            border: 'none',
            background: checking ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg,#6366f1,#a855f7)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.82rem',
            cursor: checking ? 'wait' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {checking ? '⏳ Checking…' : '🔄 Check Again'}
        </button>

        {checkResult === 'still-offline' && (
          <span style={{ fontSize: '0.78rem', color: '#f87171' }}>
            ❌ Still not running. Complete steps 1–3 above.
          </span>
        )}
      </div>

      {/* Using basic mode note */}
      <p style={{
        marginTop: 14, marginBottom: 0,
        fontSize: '0.76rem',
        color: 'rgba(241,245,249,0.4)',
        lineHeight: 1.5,
      }}>
        💡 Meanwhile, NeuroLex is running in <strong style={{ color: '#fbbf24' }}>Basic Mode</strong> using
        built-in keyword responses. All your lessons, quizzes, and progress are saved locally.
      </p>
    </div>
  )
}

function Step({ number, title, children }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        background: 'linear-gradient(135deg,#6366f1,#a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: 1,
      }}>
        {number}
      </div>
      <div style={{ flex: 1 }}>
        <span style={{ fontWeight: 600, color: 'rgba(241,245,249,0.9)', fontSize: '0.83rem' }}>
          {title}:{' '}
        </span>
        <span style={{ fontSize: '0.82rem', color: 'rgba(241,245,249,0.6)' }}>{children}</span>
      </div>
    </div>
  )
}

const codeStyle = {
  display: 'block',
  margin: '5px 0',
  padding: '5px 10px',
  borderRadius: 6,
  background: 'rgba(0,0,0,0.35)',
  color: '#a5f3fc',
  fontFamily: 'Consolas, monospace',
  fontSize: '0.78rem',
  letterSpacing: '0.03em',
}
