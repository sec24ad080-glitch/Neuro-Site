import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { sendGeminiMessage, startEnhancedListening } from '../services/gemini.js'
import { speak, getLangCode } from '../services/tts.js'
import { getGeminiApiKey } from '../services/storage.js'

export default function LexWidget() {
  const { settings } = useApp()
  const navigate = useNavigate()
  const apiKey = getGeminiApiKey()
  const lang = getLangCode(settings.language)

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Lex! 🤖 Say my name or click the mic to talk to me from anywhere!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef(null)
  const chatEndRef = useRef(null)

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen, interimText])

  const handleSend = async (text = input) => {
    if (!text.trim()) return
    setIsOpen(true) // Ensure it opens if triggered via voice command
    const newMsgs = [...messages, { role: 'user', content: text }]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)

    const reply = await sendGeminiMessage(newMsgs, text, apiKey)
    setMessages([...newMsgs, { role: 'assistant', content: reply }])
    setLoading(false)

    if (settings.ttsEnabled) speak(reply, settings.speechRate, lang)
  }

  const toggleListen = () => {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    setListening(true)
    setIsOpen(true)
    setInterimText('')
    
    recognitionRef.current = startEnhancedListening(
      (transcript) => {
        setListening(false)
        setInterimText('')
        handleSend(transcript)
      },
      (interim) => setInterimText(interim),
      () => {
        setListening(false)
        setInterimText('')
      },
      lang
    )
  }

  return (
    <>
      {/* Floating Buttons */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        display: 'flex', flexDirection: 'column', gap: 12, zIndex: 9999
      }}>
        {/* Mic Button (Voice Command) */}
        <button
          onClick={toggleListen}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            background: listening ? '#ef4444' : '#0d0d1a',
            border: `1px solid ${listening ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
            color: '#fff', fontSize: 20, cursor: 'pointer',
            boxShadow: listening ? '0 0 20px rgba(239,68,68,0.5)' : '0 4px 12px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          title="Voice Command"
        >
          {listening ? '🔴' : '🎤'}
        </button>

        {/* Lex Avatar Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, position: 'relative'
          }}
        >
          🤖
          {!isOpen && (
            <span style={{
              position: 'absolute', top: -4, right: -4, width: 14, height: 14,
              background: '#ef4444', border: '2px solid #0d0d1a', borderRadius: '50%'
            }} />
          )}
        </button>
      </div>

      {/* Chat Overlay */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, width: 340, height: 480,
          background: 'rgba(13,13,26,0.95)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 9998,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'fadeInUp 0.3s ease'
        }}>
          {/* Header */}
          <div style={{
            background: 'rgba(255,255,255,0.05)', padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>🤖</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>Lex</div>
                <div style={{ fontSize: '0.7rem', color: '#34d399' }}>● Online</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#f1f5f9', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                background: m.role === 'user' ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.05)',
                padding: '10px 14px', borderRadius: 16,
                borderBottomRightRadius: m.role === 'user' ? 4 : 16,
                borderBottomLeftRadius: m.role === 'assistant' ? 4 : 16,
                maxWidth: '85%', fontSize: '0.85rem', color: '#f1f5f9', lineHeight: 1.5
              }}>
                {m.content}
              </div>
            ))}
            
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: 16, fontSize: '0.85rem' }}>
                <span className="animate-spin" style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(255,255,255,0.2)', borderTop: '2px solid #fff', borderRadius: '50%' }} />
              </div>
            )}
            
            {interimText && (
              <div style={{ alignSelf: 'flex-end', background: 'transparent', padding: '4px 10px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                "{interimText}"
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask Lex anything..."
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 999, padding: '8px 16px', color: '#fff', fontSize: '0.85rem'
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none',
                  borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: input.trim() ? 1 : 0.5
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
