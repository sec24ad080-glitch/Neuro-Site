import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { sendLocalLLMMessage, checkOllamaStatus, getStoredModel } from '../services/localLLM.js'
import { sendGeminiMessage } from '../services/gemini.js'
import { speak, stopSpeaking, startListening, getLangCode, isSTTAvailable, isTTSAvailable } from '../services/tts.js'
import { detectIntent, INTENTS, VOICE_COMMAND_HELP } from '../services/voiceCommands.js'
import { getChatHistory, saveChatHistory, clearChatHistory,
         getOllamaModel, setOllamaModel, getAIMode,
         getCurrentLesson, setCurrentLesson,
         getLessonProgress, saveLessonProgress, getGeminiApiKey } from '../services/storage.js'

// ──────────────────────────────────────────────
// Suggested starter prompts
// ──────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  { label: '🔢 Help me with maths', text: 'Help me understand addition and subtraction' },
  { label: '📖 Help me read better', text: 'How do I get better at reading words?' },
  { label: '🌿 What is photosynthesis?', text: 'Can you explain photosynthesis in simple words?' },
  { label: '💪 I am stuck, help!', text: "I'm feeling stuck and can't understand. Help me please!" },
  { label: '🚀 Tell me about space!', text: 'Tell me something fun about the solar system!' },
]

// Tamil translation mini-dictionary
const TAMIL_PHRASES = {
  hello: 'வணக்கம்',
  good: 'நல்லது',
  great: 'அருமை',
  lesson: 'பாடம்',
  quiz: 'வினாடி வினா',
  help: 'உதவி',
  math: 'கணிதம்',
  english: 'ஆங்கிலம்',
  science: 'அறிவியல்',
}

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────
export default function ChatbotPage() {
  const { currentProfile, settings, addPoints, showNotification } = useApp()
  const navigate  = useNavigate()
  const geminiKey = getGeminiApiKey()
  const lang      = getLangCode(settings.language)

  // ── State ──
  const [messages,      setMessages]      = useState([])
  const [input,         setInput]         = useState('')
  const [voiceState,    setVoiceState]    = useState('idle')   // idle|listening|processing|speaking
  const [interimText,   setInterimText]   = useState('')
  const [aiSource,      setAiSource]      = useState('offline') // 'ollama'|'gemini'|'offline'
  const [ollamaRunning, setOllamaRunning] = useState(null)      // null=checking, true, false
  const [ollamaModel,   setOllamaModelState] = useState(getOllamaModel())
  const [showSetup,     setShowSetup]     = useState(false)
  const [diffLevel,     setDiffLevel]     = useState('normal')  // easy|normal|hard
  const [currentLesson, setCurrLesson]    = useState(null)
  const [lastBotMsg,    setLastBotMsg]    = useState('')
  const [showCommands,  setShowCommands]  = useState(false)
  const [isTamil,       setIsTamil]       = useState(false)

  const messagesEndRef  = useRef(null)
  const recognitionRef  = useRef(null)
  const inputRef        = useRef(null)
  const voiceStateRef   = useRef(voiceState) // ref to avoid stale closure

  useEffect(() => { voiceStateRef.current = voiceState }, [voiceState])

  // ── Load chat history on mount ──
  useEffect(() => {
    if (!currentProfile?.id) return
    const history = getChatHistory(currentProfile.id)
    if (history.length > 0) {
      setMessages(history)
      const lastAI = [...history].reverse().find(m => m.role === 'assistant')
      if (lastAI) setLastBotMsg(lastAI.content)
    } else {
      const welcome = buildMessage('assistant', greetingText(currentProfile.name))
      setMessages([welcome])
    }
  }, [currentProfile?.id])

  // ── Check Ollama on mount ──
  useEffect(() => {
    checkAiSource()
  }, [])

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Determine AI source ──
  async function checkAiSource() {
    setOllamaRunning(null)
    const status = await checkOllamaStatus()
    setOllamaRunning(status.running)

    const activeKey = getGeminiApiKey()
    const mode = getAIMode()

    if (activeKey && navigator.onLine && mode !== 'ollama') {
      setAiSource('gemini')
      setShowSetup(false)
    } else if (status.running && mode !== 'gemini') {
      setAiSource('ollama')
      setShowSetup(false)
    } else {
      setAiSource('offline')
      setShowSetup(!status.running)
    }
  }

  // ── Helper: build a message object ──
  function buildMessage(role, content, meta = {}) {
    return { role, content, id: `${Date.now()}-${Math.random()}`, ...meta }
  }

  function greetingText(name) {
    return `Hi ${name || 'there'}! 👋 I'm NeuroLex, your learning buddy!\n\nI can help you learn maths, reading, science, and more. You can type or speak to me!\n\n🎤 Try saying "Start lesson", "Help me", or just ask me any question! 🌟`
  }

  // ──────────────────────────────────────────────
  // Send a message (text or voice)
  // ──────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim()
    if (!msg) return
    setInput('')
    setInterimText('')

    const userMsg = buildMessage('user', msg)
    const updated = [...messages, userMsg]
    setMessages(updated)
    setVoiceState('processing')

    // Detect intent first
    const { intent, raw } = detectIntent(msg)
    let reply = ''

    if (intent !== INTENTS.FREE_QUESTION) {
      // ── Handle voice command ──
      reply = await handleVoiceCommand(intent, raw, updated)
    } else {
      // ── Free-form question → send to AI ──
      reply = await sendToAI(updated, msg)
    }

    const aiMsg = buildMessage('assistant', reply)
    const withAI = [...updated, aiMsg]
    setMessages(withAI)
    setLastBotMsg(reply)
    setVoiceState('idle')

    // Save history & award points
    if (currentProfile?.id) {
      saveChatHistory(currentProfile.id, withAI)
      addPoints(2)
    }

    // TTS
    if (settings.ttsEnabled !== false) {
      setVoiceState('speaking')
      const ttsLang = isTamil ? 'ta-IN' : lang
      speak(reply, settings.speechRate || 0.85, ttsLang)
      // Reset to idle when speech ends (approx)
      const words = reply.split(' ').length
      setTimeout(() => setVoiceState('idle'), Math.min(words * 350, 8000))
    }
  }, [messages, input, aiSource, ollamaModel, diffLevel, currentLesson, isTamil, settings, lang, currentProfile, addPoints])

  // ──────────────────────────────────────────────
  // Route to AI backend
  // ──────────────────────────────────────────────
  async function sendToAI(msgHistory, userMessage) {
    // Build context for AI
    const contextMessages = msgHistory.slice(-8) // last 8 messages for context
    const activeKey = getGeminiApiKey()

    if (aiSource === 'ollama') {
      const result = await sendLocalLLMMessage(contextMessages, userMessage, {
        model: ollamaModel,
        difficultyLevel: diffLevel,
      })
      return result.text
    }

    if ((aiSource === 'gemini' || activeKey) && navigator.onLine) {
      try {
        const geminiReply = await sendGeminiMessage(contextMessages, userMessage, activeKey)
        if (geminiReply) return geminiReply
      } catch (err) {
        console.warn('Gemini response error, falling back:', err)
      }
    }

    // Keyword fallback
    const { sendLocalLLMMessage: fallback } = await import('../services/localLLM.js')
    const result = await fallback([], userMessage, { model: 'offline' })
    return result.text
  }

  // ──────────────────────────────────────────────
  // Voice command handlers
  // ──────────────────────────────────────────────
  async function handleVoiceCommand(intent, raw, msgHistory) {
    switch (intent) {

      case INTENTS.START_LESSON: {
        const lessons = getAllLessons()
        const first = lessons[0]
        if (!first) return "I don't have any lessons loaded right now. Try typing a question! 📚"
        setCurrLesson(first)
        if (currentProfile?.id) setCurrentLesson(currentProfile.id, first.id)
        return formatLessonReply(first)
      }

      case INTENTS.NEXT_LESSON: {
        if (!currentLesson) {
          const lessons = getAllLessons()
          const first = lessons[0]
          setCurrLesson(first)
          return formatLessonReply(first)
        }
        const next = getNextLesson(currentLesson.id)
        if (!next) return "🎉 Amazing! You've finished all the lessons in this subject! Try the quiz or start a new subject!"
        setCurrLesson(next)
        if (currentProfile?.id) {
          setCurrentLesson(currentProfile.id, next.id)
          saveLessonProgress(currentProfile.id, currentLesson.id, { completed: true })
          addPoints(10)
        }
        return formatLessonReply(next)
      }

      case INTENTS.PREV_LESSON: {
        if (!currentLesson) return "We haven't started a lesson yet! Say 'Start lesson' to begin! 📖"
        const prev = getPrevLesson(currentLesson.id)
        if (!prev) return "You're already at the first lesson! It's a great one — keep going! 💪"
        setCurrLesson(prev)
        if (currentProfile?.id) setCurrentLesson(currentProfile.id, prev.id)
        return formatLessonReply(prev)
      }

      case INTENTS.START_QUIZ: {
        navigate('/quiz/math')
        return "Opening the quiz page for you! 🎯 Good luck — you've got this!"
      }

      case INTENTS.REPEAT: {
        if (!lastBotMsg) return "There's nothing to repeat yet! Ask me a question first. 😊"
        return lastBotMsg
      }

      case INTENTS.READ_THIS: {
        if (!currentLesson) return "I'll need some content to read! Start a lesson first by saying 'Start lesson'. 📖"
        return `Let me read the current lesson for you! 🔊\n\n${currentLesson.content}`
      }

      case INTENTS.EXPLAIN_THIS: {
        if (!currentLesson) {
          return await sendToAI(msgHistory, "Can you explain what we just talked about in a simpler way?")
        }
        return await sendToAI(
          msgHistory,
          `Please explain "${currentLesson.title}" in a very simple way using a real-life example.`
        )
      }

      case INTENTS.MAKE_EASIER: {
        setDiffLevel('easy')
        const simpler = await sendToAI(
          msgHistory,
          lastBotMsg
            ? `Please explain that again but even simpler. Use very short sentences and basic words only.`
            : `Explain what we talked about in the simplest possible way.`
        )
        return `Sure! Let me make that simpler for you 😊\n\n${simpler}`
      }

      case INTENTS.MAKE_HARDER: {
        setDiffLevel('hard')
        const harder = await sendToAI(
          msgHistory,
          lastBotMsg
            ? `Please give a more detailed and challenging explanation of what we just discussed.`
            : `Give a more advanced and challenging explanation of the topic.`
        )
        return `Let's level up! 💪 Here's a more detailed version:\n\n${harder}`
      }

      case INTENTS.SHOW_PROGRESS: {
        const pts = currentProfile?.points || 0
        const lvl = currentProfile?.level  || 1
        const badges = currentProfile?.badges || []
        const lessonProg = currentProfile?.id ? getLessonProgress(currentProfile.id) : {}
        const completedLessons = Object.keys(lessonProg).length

        return `Here's your progress, ${currentProfile?.name || 'friend'}! 🌟

⭐ Points: ${pts}
🏆 Level: ${lvl}
📚 Lessons completed: ${completedLessons}
🏅 Badges: ${badges.length > 0 ? badges.join(', ') : 'Keep learning to earn badges!'}

You're doing amazing! Keep going! 💪`
      }

      case INTENTS.GO_HOME: {
        navigate('/dashboard')
        return "Taking you home! 🏠 Great work today!"
      }

      case INTENTS.STOP_READING: {
        stopSpeaking()
        setVoiceState('idle')
        return "Stopped! 🔇 I'll be quiet now. Let me know when you need me!"
      }

      case INTENTS.TRANSLATE_TAMIL: {
        setIsTamil(true)
        return `நல்லது! 🌟 இப்போது நான் தமிழில் பேசுவேன்!\n(Good! I'll now respond in Tamil! தமிழ் மொழியில் உங்கள் கேள்விகளை கேளுங்கள்.)`
      }

      case INTENTS.HELP_ME: {
        const cmdList = VOICE_COMMAND_HELP
          .map(c => `${c.command} → ${c.action}`)
          .join('\n')
        return `Here are all the voice commands you can use! 🎤\n\n${cmdList}\n\nYou can also just ask me any question — I'm always here to help! 😊`
      }

      default:
        return await sendToAI(msgHistory, raw)
    }
  }

  function formatLessonReply(lesson) {
    return `📖 **${lesson.emoji} ${lesson.title}** (${lesson.subject} — Level ${lesson.level})\n\n${lesson.content}\n\n---\n💡 **Activity:** ${lesson.activity}\n\nSay "Next lesson" to continue or "Explain this" for more help! 🌟`
  }

  // ──────────────────────────────────────────────
  // Voice input handler
  // ──────────────────────────────────────────────
  const handleVoiceInput = useCallback(() => {
    if (voiceStateRef.current === 'speaking') {
      stopSpeaking()
      setVoiceState('idle')
      return
    }

    if (voiceStateRef.current === 'listening') {
      recognitionRef.current?.stop()
      return
    }

    if (!isSTTAvailable()) {
      showNotification('🎤 Voice input is not available in this browser. Try Chrome or Edge!', 'info')
      return
    }

    setVoiceState('listening')
    setInterimText('')

    recognitionRef.current = startListening(
      (transcript) => {
        setInterimText('')
        setVoiceState('processing')
        sendMessage(transcript)
      },
      (interim) => setInterimText(interim),
      () => {
        if (voiceStateRef.current === 'listening') setVoiceState('idle')
        setInterimText('')
      },
      isTamil ? 'ta-IN' : lang
    )
  }, [lang, isTamil, sendMessage, showNotification])

  // ──────────────────────────────────────────────
  // Clear chat
  // ──────────────────────────────────────────────
  const handleClear = () => {
    stopSpeaking()
    const welcome = buildMessage('assistant', greetingText(currentProfile?.name))
    setMessages([welcome])
    setLastBotMsg('')
    setDiffLevel('normal')
    setIsTamil(false)
    setCurrLesson(null)
    if (currentProfile?.id) {
      clearChatHistory(currentProfile.id)
    }
  }

  // ──────────────────────────────────────────────
  // Speak a single message
  // ──────────────────────────────────────────────
  const speakMsg = (content) => {
    if (!isTTSAvailable()) return
    setVoiceState('speaking')
    speak(content, settings.speechRate || 0.85, isTamil ? 'ta-IN' : lang)
    const words = content.split(' ').length
    setTimeout(() => setVoiceState('idle'), Math.min(words * 350, 8000))
  }

  // ──────────────────────────────────────────────
  // Format message content (simple markdown)
  // ──────────────────────────────────────────────
  function formatContent(content) {
    const lines = content.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={i} style={{ display: 'block', marginTop: 6 }}>{line.slice(2, -2)}</strong>
      }
      if (line === '---') {
        return <hr key={i} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />
      }
      if (line.startsWith('💡') || line.startsWith('⭐') || line.startsWith('🏆') || line.startsWith('📚') || line.startsWith('🏅')) {
        return <p key={i} style={{ margin: '4px 0', lineHeight: 1.6 }}>{line}</p>
      }
      return <span key={i}>{line}<br /></span>
    })
  }

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
  const isLoading = voiceState === 'processing'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg,#6366f1,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: '0 0 16px rgba(99,102,241,0.4)',
          }}>🤖</div>
          <div>
            <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '1rem' }}>NeuroLex AI Tutor</h3>
            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
              {ollamaRunning === null
                ? <span style={{ fontSize: '0.7rem', color: 'rgba(241,245,249,0.4)' }}>Checking AI…</span>
                : <OfflineBadge status={aiSource} model={ollamaModel} small />
              }
              {isTamil && (
                <span style={{
                  fontSize: '0.68rem', padding: '2px 8px', borderRadius: 999,
                  background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)',
                  color: '#c084fc', fontWeight: 600,
                }}>🌐 Tamil</span>
              )}
              {diffLevel !== 'normal' && (
                <span style={{
                  fontSize: '0.68rem', padding: '2px 8px', borderRadius: 999,
                  background: diffLevel === 'easy' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  border: `1px solid ${diffLevel === 'easy' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  color: diffLevel === 'easy' ? '#34d399' : '#f87171', fontWeight: 600,
                }}>{diffLevel === 'easy' ? '🟢 Easy Mode' : '🔴 Hard Mode'}</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowCommands(v => !v)}
            title="Voice commands"
            style={{ fontSize: '0.78rem' }}
          >
            🎤 Commands
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => { stopSpeaking(); setVoiceState('idle') }}>
            🔇 Stop
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleClear}>
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* ── Voice commands panel ── */}
      {showCommands && (
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(99,102,241,0.05)',
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '0.82rem', color: '#818cf8' }}>
            🎤 Voice Commands
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {VOICE_COMMAND_HELP.map(c => (
              <button
                key={c.command}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '3px 10px' }}
                title={c.action}
                onClick={() => sendMessage(c.command.replace(/"/g, ''))}
              >
                {c.command}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Ollama setup card ── */}
      {showSetup && (
        <OllamaSetupCard
          suggestedModel={ollamaModel}
          onCheckAgain={(status) => {
            setOllamaRunning(true)
            setAiSource('ollama')
            setShowSetup(false)
            showNotification('✅ Ollama connected! Local AI is ready.', 'success')
          }}
        />
      )}

      {/* ── Messages ── */}
      <div
        style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}
        className="scrollbar-hide"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="animate-fadeInUp"
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: 8, alignItems: 'flex-end',
            }}
          >
            {msg.role === 'assistant' && (
              <div style={{
                width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
              }}>🤖</div>
            )}
            <div
              className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
              style={{ maxWidth: '78%', lineHeight: 1.65, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}
            >
              {formatContent(msg.content)}
            </div>
            {msg.role === 'assistant' && (
              <button
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(241,245,249,0.35)', fontSize: 13,
                  padding: 4, alignSelf: 'flex-end',
                  transition: 'color 0.2s',
                }}
                onClick={() => speakMsg(msg.content)}
                title="Read aloud"
              >🔊</button>
            )}
          </div>
        ))}

        {/* Loading dots */}
        {isLoading && (
          <div className="animate-fadeIn" style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{
              width: 30, height: 30, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg,#6366f1,#a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
            }}>🤖</div>
            <div className="chat-bubble-ai" style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '10px 14px' }}>
              {[0,1,2].map(n => (
                <div key={n} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'rgba(99,102,241,0.7)',
                  animation: 'float 1.2s ease-in-out infinite',
                  animationDelay: `${n * 0.18}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested prompts (show when few messages) ── */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 20px 10px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SUGGESTED_PROMPTS.map(p => (
            <button
              key={p.text}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.76rem' }}
              onClick={() => sendMessage(p.text)}
            >{p.label}</button>
          ))}
        </div>
      )}

      {/* ── Input area ── */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        {/* Interim voice text */}
        {interimText && (
          <div style={{
            fontSize: '0.8rem', color: 'rgba(241,245,249,0.5)',
            marginBottom: 8, fontStyle: 'italic', paddingLeft: 4,
          }}>
            🎤 "{interimText}"
          </div>
        )}

        {/* Current lesson indicator */}
        {currentLesson && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 8, padding: '4px 10px', borderRadius: 8,
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
            fontSize: '0.75rem', color: 'rgba(241,245,249,0.6)',
          }}>
            <span>{currentLesson.emoji}</span>
            <span>Current: <strong style={{ color: '#818cf8' }}>{currentLesson.title}</strong></span>
            <button
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                       color: 'rgba(241,245,249,0.4)', fontSize: 11 }}
              onClick={() => { setCurrLesson(null); setCurrentLesson(currentProfile?.id, null) }}
            >✕</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Voice Orb */}
          <VoiceOrb
            state={voiceState === 'processing' ? 'processing' : voiceState}
            onClick={handleVoiceInput}
            size={46}
            disabled={isLoading && voiceState !== 'speaking'}
          />

          {/* Text input */}
          <input
            ref={inputRef}
            className="input"
            placeholder={voiceState === 'listening' ? '🎤 Listening…' : 'Ask me anything or use a voice command…'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !isLoading && sendMessage()}
            disabled={isLoading || voiceState === 'listening'}
            style={{ flex: 1, fontSize: '0.88rem' }}
          />

          {/* Send button */}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            style={{ flexShrink: 0, width: 42, height: 42, borderRadius: '50%', padding: 0, fontSize: 16 }}
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>

        {/* STT not available warning */}
        {!isSTTAvailable() && (
          <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: 'rgba(241,245,249,0.35)' }}>
            💬 Voice input requires Chrome or Edge browser. Text input works everywhere!
          </p>
        )}
      </div>
    </div>
  )
}
