import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { LANGUAGES } from '../services/i18n.js'
import { checkOllamaStatus, DEFAULT_MODEL } from '../services/localLLM.js'
import { getOllamaModel, setOllamaModel, getAIMode, setAIMode, getGeminiApiKey, setGeminiApiKey } from '../services/storage.js'
import { testGeminiApiKey } from '../services/gemini.js'

const OLLAMA_MODELS = [
  { value: 'gemma2:2b',   label: 'Gemma 2B (Recommended) — ~1.6 GB' },
  { value: 'phi3:mini',  label: 'Phi-3 Mini — ~2.3 GB' },
  { value: 'tinyllama',  label: 'TinyLlama — ~600 MB (smallest)' },
  { value: 'llama3.2:1b', label: 'Llama 3.2 1B — ~1.3 GB' },
]

export default function SettingsPage() {
  const { settings, updateSettings, currentProfile, showNotification } = useApp()
  const [geminiKey,    setGeminiKey]    = useState(getGeminiApiKey() || '')
  const [showKey,      setShowKey]      = useState(false)
  const [geminiTesting, setGeminiTesting] = useState(false)
  const [geminiStatus, setGeminiStatus]  = useState(null)
  const [aiMode,       setAiModeState]  = useState(getAIMode())
  const [ollamaModel,  setOllamaModelSt] = useState(getOllamaModel())
  const [testResult,   setTestResult]   = useState(null)  // null | 'success' | 'fail'
  const [testing,      setTesting]      = useState(false)

  const handleSaveGeminiKey = (keyVal) => {
    const val = keyVal !== undefined ? keyVal : geminiKey
    setGeminiApiKey(val)
    showNotification('Gemini API Key saved!', 'success')
  }

  const handleTestGemini = async () => {
    setGeminiTesting(true)
    setGeminiStatus(null)
    const result = await testGeminiApiKey(geminiKey)
    setGeminiTesting(false)
    if (result.ok) {
      setGeminiStatus({ ok: true, msg: `Connected! Model: ${result.model}` })
      handleSaveGeminiKey(geminiKey)
      showNotification(`✅ Gemini API connected! (${result.model})`, 'success')
    } else {
      setGeminiStatus({ ok: false, msg: result.error })
      showNotification(`❌ Gemini API Error: ${result.error}`, 'error')
    }
  }

  const toggle = (key) => {
    updateSettings({ [key]: !settings[key] })
    showNotification(`${key} ${!settings[key] ? 'enabled' : 'disabled'}`, 'info')
  }

  const handleAiMode = (mode) => {
    setAiModeState(mode)
    setAIMode(mode)
    showNotification(`AI mode set to ${mode}`, 'info')
  }

  const handleModelChange = (model) => {
    setOllamaModelSt(model)
    setOllamaModel(model)
    showNotification(`Model set to ${model}`, 'info')
  }

  const testOllama = async () => {
    setTesting(true)
    setTestResult(null)
    const status = await checkOllamaStatus()
    setTesting(false)
    if (status.running) {
      setTestResult('success')
      const modelList = status.models.join(', ') || '(no models downloaded yet)'
      showNotification(`✅ Ollama connected! Models: ${modelList}`, 'success')
    } else {
      setTestResult('fail')
      showNotification('❌ Ollama not running. See the chatbot page for setup instructions.', 'info')
    }
  }

  const ToggleSwitch = ({ id, label, desc, checked, onChange, icon }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px', borderRadius: 16,
      background: checked ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
      border: `1.5px solid ${checked ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.08)'}`,
      transition: 'all 0.22s ease', gap: 16
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.92rem' }}>{label}</div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(241,245,249,0.45)', marginTop: 2 }}>{desc}</div>
        </div>
      </div>
      <button
        id={id}
        onClick={onChange}
        style={{
          width: 50, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
          background: checked ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'rgba(255,255,255,0.12)',
          position: 'relative', transition: 'all 0.25s ease', flexShrink: 0,
          boxShadow: checked ? '0 0 12px rgba(99,102,241,0.4)' : 'none'
        }}
        role="switch" aria-checked={checked}
      >
        <div style={{
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 4, left: checked ? 26 : 4,
          transition: 'left 0.25s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        }} />
      </button>
    </div>
  )

  return (
    <div className="page-container">
      <div className="animate-fadeInUp" style={{ marginBottom: 28 }}>
        <h1>⚙️ <span className="gradient-text">Settings</span></h1>
        <p>Customize NeuroLite to work best for you.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Accessibility ── */}
        <div className="glass-card animate-fadeInUp" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: 16 }}>♿ Accessibility</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ToggleSwitch id="dyslexic-font" icon="🔤" label="Dyslexia-Friendly Font"
              desc="Uses Comic Sans — easier for dyslexic readers"
              checked={settings.dyslexicFont} onChange={() => toggle('dyslexicFont')} />
            <ToggleSwitch id="high-contrast" icon="🌗" label="High Contrast Mode"
              desc="Increases contrast for better visibility"
              checked={settings.highContrast} onChange={() => toggle('highContrast')} />
            <ToggleSwitch id="reduced-motion" icon="⏹️" label="Reduced Motion Mode"
              desc="Disables animations and slows background loops for sensory comfort"
              checked={settings.reducedMotion} onChange={() => toggle('reducedMotion')} />
            <ToggleSwitch id="light-theme" icon="☀️" label="Light Background Mode"
              desc="Switches between soft white/light EdTech surfaces and dark focus mode"
              checked={settings.theme === 'light'} onChange={() => updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })} />
            <ToggleSwitch id="tts-enabled" icon="🔊" label="Text-to-Speech"
              desc="Reads questions and responses aloud"
              checked={settings.ttsEnabled} onChange={() => toggle('ttsEnabled')} />
          </div>
        </div>

        {/* ── Speech speed ── */}
        <div className="glass-card animate-fadeInUp delay-1" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: 16 }}>🎙️ Speech Speed</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(241,245,249,0.5)', flexShrink: 0 }}>Slow 🐢</span>
            <div style={{ flex: 1 }}>
              <input
                type="range" min="0.5" max="1.5" step="0.05"
                value={settings.speechRate}
                onChange={e => updateSettings({ speechRate: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(241,245,249,0.35)' }}>0.5×</span>
                <span style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 700 }}>{settings.speechRate}×</span>
                <span style={{ fontSize: '0.72rem', color: 'rgba(241,245,249,0.35)' }}>1.5×</span>
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'rgba(241,245,249,0.5)', flexShrink: 0 }}>Fast 🐇</span>
          </div>
        </div>

        {/* ── Language ── */}
        <div className="glass-card animate-fadeInUp delay-2" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: 16 }}>🌐 Language</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                className="btn"
                style={{
                  background: settings.language === l.code ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${settings.language === l.code ? 'transparent' : 'rgba(255,255,255,0.10)'}`,
                  color: '#f1f5f9',
                  boxShadow: settings.language === l.code ? '0 0 16px rgba(99,102,241,0.4)' : 'none',
                }}
                onClick={() => updateSettings({ language: l.code })}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Profile info ── */}
        <div className="glass-card animate-fadeInUp delay-4" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: 16 }}>👤 Profile</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(135deg,#6366f1,#a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28
            }}>{currentProfile?.avatar}</div>
            <div>
              <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1rem' }}>{currentProfile?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(241,245,249,0.45)', marginTop: 2 }}>
                Level {currentProfile?.level || 1} · {currentProfile?.points || 0} points · {currentProfile?.badges?.length || 0} badges
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
