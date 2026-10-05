import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { speak, startListening, getLangCode } from '../services/tts.js'
import { sendGeminiMessage } from '../services/gemini.js'

const SPELLING_WORDS = ['adventure', 'beautiful', 'calendar', 'dangerous', 'elephant', 'fantastic', 'gorgeous', 'happiness', 'important', 'journey']

export default function WritingPage() {
  const { settings, addPoints, showNotification } = useApp()
  const apiKey  = import.meta.env.VITE_GEMINI_API_KEY
  const lang    = getLangCode(settings.language)

  const [text,        setText]        = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loadingSugg, setLoadingSugg] = useState(false)
  const [dictWord,    setDictWord]    = useState('')
  const [listening,   setListening]   = useState(false)
  const [interimText, setInterimText] = useState('')
  const [wordCount,   setWordCount]   = useState(0)
  const textareaRef                   = useRef(null)
  const debounceRef                   = useRef(null)
  const recognitionRef                = useRef(null)

  useEffect(() => {
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
    clearTimeout(debounceRef.current)
    if (text.trim().length > 10) {
      debounceRef.current = setTimeout(() => fetchSuggestions(text), 1500)
    }
  }, [text])

  const fetchSuggestions = async (content) => {
    if (!apiKey || !navigator.onLine) return
    setLoadingSugg(true)
    try {
      const prompt = `Read this text written by a child and give 2-3 short, encouraging improvement tips. Focus on: spelling, clarity, or missing words. Keep each tip to 1 sentence and use emojis. Text: "${content.slice(-200)}"`
      const reply  = await sendGeminiMessage([], prompt, apiKey)
      setSuggestions(reply.split('\n').filter(Boolean).slice(0, 3))
    } catch { setSuggestions([]) }
    setLoadingSugg(false)
  }

  const handleDictation = () => {
    if (listening) { recognitionRef.current?.stop(); return }
    setListening(true)
    setInterimText('')
    recognitionRef.current = startListening(
      (transcript) => {
        setListening(false)
        setInterimText('')
        setText(t => t + (t ? ' ' : '') + transcript)
        textareaRef.current?.focus()
      },
      (interim) => setInterimText(interim),
      () => { setListening(false); setInterimText('') },
      lang
    )
  }

  const hearSpelling = () => {
    if (!dictWord.trim()) return
    speak(`${dictWord}. ${dictWord.split('').join('. ')}. ${dictWord}`, settings.speechRate, lang)
  }

  const handleSave = () => {
    if (wordCount < 5) { showNotification('Write a bit more first!', 'info'); return }
    addPoints(Math.min(wordCount * 2, 50))
    showNotification(`Great writing! +${Math.min(wordCount * 2, 50)} points 🎉`, 'success')
  }

  return (
    <div className="page-container">
      <div className="animate-fadeInUp" style={{ marginBottom: 24 }}>
        <h1>✏️ <span className="gradient-text">Writing Helper</span></h1>
        <p>Write freely — your AI tutor gives tips as you type!</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* ── Left: Writing area ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className={`btn btn-sm ${listening ? 'btn-danger' : 'btn-secondary'}`} onClick={handleDictation}>
              {listening ? '🔴 Listening...' : '🎤 Dictate'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => speak(text, settings.speechRate, lang)} disabled={!text}>
              🔊 Read Aloud
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => { setText(''); setSuggestions([]) }}>
              🗑️ Clear
            </button>
            {interimText && (
              <span style={{ fontSize: '0.8rem', color: 'rgba(241,245,249,0.5)', fontStyle: 'italic', marginLeft: 8 }}>
                "{interimText}"
              </span>
            )}
            <span className="badge badge-indigo" style={{ marginLeft: 'auto' }}>
              {wordCount} words
            </span>
          </div>

          {/* Textarea */}
          <div style={{ position: 'relative' }}>
            <textarea
              ref={textareaRef}
              className="input"
              style={{
                minHeight: 320, resize: 'vertical', lineHeight: 1.8,
                fontFamily: settings.dyslexicFont ? "'Comic Sans MS', cursive" : 'inherit',
                fontSize: settings.dyslexicFont ? '1.05rem' : '0.95rem',
                letterSpacing: settings.dyslexicFont ? '0.05em' : 'normal',
              }}
              placeholder="Start writing here... Tell a story, describe something you learned, or anything you like! ✍️"
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>

          {/* Save */}
          <button className="btn btn-green" onClick={handleSave} disabled={wordCount < 5}>
            💾 Save & Earn Points ({Math.min(wordCount * 2, 50)} pts)
          </button>
        </div>

        {/* ── Right: Tools panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* AI Suggestions */}
          <div className="glass-card" style={{ padding: 18 }}>
            <h4 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              🤖 AI Writing Tips
              {loadingSugg && <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(99,102,241,0.2)', borderTop: '2px solid #6366f1', borderRadius: '50%', display: 'inline-block' }} />}
            </h4>
            {suggestions.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'rgba(241,245,249,0.4)', fontStyle: 'italic' }}>
                {apiKey ? 'Start writing and I\'ll give you tips! ✨' : 'Add VITE_GEMINI_API_KEY to enable AI tips'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {suggestions.map((s, i) => (
                  <div key={i} className="animate-fadeInUp" style={{
                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)',
                    borderRadius: 10, padding: '10px 12px', fontSize: '0.83rem', color: 'rgba(241,245,249,0.85)'
                  }}>
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Spelling helper */}
          <div className="glass-card" style={{ padding: 18 }}>
            <h4 style={{ margin: '0 0 12px' }}>🔤 Spelling Helper</h4>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                className="input"
                placeholder="Type a word..."
                value={dictWord}
                onChange={e => setDictWord(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && hearSpelling()}
                style={{ flex: 1, fontSize: '0.9rem' }}
              />
              <button className="btn btn-secondary btn-sm" onClick={hearSpelling} style={{ flexShrink: 0 }}>
                🔊
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {SPELLING_WORDS.map(w => (
                <button
                  key={w}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  onClick={() => { setDictWord(w); speak(`${w}. ${w.split('').join('. ')}. ${w}`, settings.speechRate, lang) }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="glass-card" style={{ padding: 18, background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.15)' }}>
            <h4 style={{ margin: '0 0 10px', color: '#34d399' }}>💡 Writing Tips</h4>
            <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Start with a strong first sentence', 'Use describing words to paint a picture', 'Read your writing aloud to check it', 'It\'s OK to make mistakes — just keep going!'].map(tip => (
                <li key={tip} style={{ fontSize: '0.8rem', color: 'rgba(241,245,249,0.7)' }}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .writing-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
