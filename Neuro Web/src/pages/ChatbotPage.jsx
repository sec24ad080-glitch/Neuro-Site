import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { sendLocalLLMMessage, checkOllamaStatus, getStoredModel } from '../services/localLLM.js'
import { sendGeminiMessage } from '../services/gemini.js'
import { speak, stopSpeaking, startListening, getLangCode, isSTTAvailable, isTTSAvailable } from '../services/tts.js'
import { detectIntent, INTENTS, VOICE_COMMAND_HELP } from '../services/voiceCommands.js'
import {
  getChatHistory, saveChatHistory, clearChatHistory,
  getOllamaModel, setOllamaModel, getAIMode,
  getCurrentLesson, setCurrentLesson,
  getLessonProgress, saveLessonProgress, getGeminiApiKey
} from '../services/storage.js'
import { getSmartSubjectAnswer } from '../services/aiTutorEngine.js'
import { getAllLessons, getNextLesson, getPrevLesson } from '../data/lessons/index.js'
import VoiceOrb from '../components/VoiceOrb.jsx'
import OfflineBadge from '../components/OfflineBadge.jsx'
import OllamaSetupCard from '../components/OllamaSetupCard.jsx'

// ──────────────────────────────────────────────
// Categorized Suggested Prompts for Subject Learning
// ──────────────────────────────────────────────
const SUBJECT_CATEGORIES = [
  { id: 'all', label: '🌟 All Prompts' },
  { id: 'math', label: '🔢 Mathematics' },
  { id: 'english', label: '📖 English' },
  { id: 'science', label: '🔬 Science' },
  { id: 'quiz', label: '🎯 Quizzes & Fun' },
]

const CATEGORIZED_PROMPTS = {
  all: [
    { label: '🔢 15 + 8 = ?', text: 'What is 15 + 8?' },
    { label: '🔤 5 Vowels', text: 'What are the 5 vowels in English?' },
    { label: '🌿 Photosynthesis', text: 'How do plants make food using photosynthesis?' },
    { label: '🪐 Solar System', text: 'Tell me about the 8 planets in the solar system!' },
    { label: '🍕 Explain Fractions', text: 'Explain fractions with pizza slices!' },
    { label: '🏷️ Nouns vs Verbs', text: 'What is the difference between a noun and a verb?' },
    { label: '🧩 Tell me a riddle', text: 'Tell me a fun brain riddle!' },
    { label: '🎯 Quiz me on Math', text: 'Quiz me on math with a fun question!' },
  ],
  math: [
    { label: '➕ 25 + 14 = ?', text: 'What is 25 + 14?' },
    { label: '➖ 20 minus 8 = ?', text: 'What is 20 - 8?' },
    { label: '✖️ 7 Times Table', text: 'Show me the 7 times table!' },
    { label: '🍕 What is 1/2 and 1/4?', text: 'Explain fractions with pizza slices!' },
    { label: '📐 Perimeter vs Area', text: 'What is the difference between perimeter and area?' },
    { label: '🔢 Skip count by 5s', text: 'How do I skip count by 5s?' },
    { label: '🔷 2D & 3D Shapes', text: 'Tell me about circles, squares, triangles, and cubes!' },
    { label: '🍎 Add 12 and 15', text: 'Add 12 and 15 for me step by step' },
  ],
  english: [
    { label: '🔤 5 Vowels (A,E,I,O,U)', text: 'What are the 5 vowels in English and why are they special?' },
    { label: '🏷️ Noun vs Verb', text: 'What is the difference between a noun and a verb?' },
    { label: '🎨 3 Adjectives for a dog', text: 'Give me 3 adjectives to describe a friendly dog!' },
    { label: '🎶 Rhymes with "Cat"', text: 'What words rhyme with cat?' },
    { label: '↔️ Opposites (Antonyms)', text: 'What are opposite words like hot and cold, big and small?' },
    { label: '✍️ Capital letters & punctuation', text: 'How do I write a correct complete sentence?' },
    { label: '🐱 Plurals (Cat → Cats)', text: 'How do plural words work in English?' },
  ],
  science: [
    { label: '🌿 Photosynthesis (Plant Food)', text: 'How do plants make food using sunlight and water?' },
    { label: '🪐 8 Planets in Solar System', text: 'Name all 8 planets in our solar system in order!' },
    { label: '💧 The Water Cycle & Rain', text: 'How does the water cycle make rain and clouds?' },
    { label: '🧠 Human Body & 5 Senses', text: 'Tell me about the heart, brain, bones, and 5 senses!' },
    { label: '🌱 Living vs Non-Living', text: 'What is the difference between living and non-living things?' },
    { label: '🦕 Dinosaur Facts', text: 'Tell me a fun and surprising dinosaur fact!' },
  ],
  quiz: [
    { label: '🎯 Math Challenge', text: 'Quiz me on math with an interactive question!' },
    { label: '🔤 English Challenge', text: 'Quiz me on English words and grammar!' },
    { label: '🧩 Brain Riddle', text: 'Give me a fun brain riddle to solve!' },
    { label: '🚀 Mindblowing Space Fact', text: 'Tell me a mindblowing space fact!' },
    { label: '🧘 3-Second Calm Breath', text: 'Guide me through a calming 3-second breathing exercise' },
  ]
}

export default function ChatbotPage() {
  const { currentProfile, settings, addPoints, showNotification } = useApp()
  const navigate = useNavigate()
  const lang = getLangCode(settings?.language || 'en')

  // ── State ──
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [voiceState, setVoiceState] = useState('idle') // idle | listening | processing | speaking
  const [interimText, setInterimText] = useState('')
  const [aiSource, setAiSource] = useState('offline') // 'ollama' | 'gemini' | 'offline'
  const [ollamaRunning, setOllamaRunning] = useState(null)
  const [ollamaModel, setOllamaModelState] = useState(getOllamaModel())
  const [showSetup, setShowSetup] = useState(false)
  const [diffLevel, setDiffLevel] = useState('normal') // easy | normal | hard
  const [currentLesson, setCurrLesson] = useState(null)
  const [lastBotMsg, setLastBotMsg] = useState('')
  const [showCommands, setShowCommands] = useState(false)
  const [isTamil, setIsTamil] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [showPromptsTray, setShowPromptsTray] = useState(true)

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const inputRef = useRef(null)
  const voiceStateRef = useRef(voiceState)

  useEffect(() => { voiceStateRef.current = voiceState }, [voiceState])

  // ── Load chat history on mount ──
  useEffect(() => {
    if (!currentProfile?.id) return
    const history = getChatHistory(currentProfile.id)
    if (history && history.length > 0) {
      setMessages(history)
      const lastAI = [...history].reverse().find(m => m.role === 'assistant')
      if (lastAI) setLastBotMsg(lastAI.content)
    } else {
      const welcome = buildMessage('assistant', greetingText(currentProfile?.name))
      setMessages([welcome])
    }
  }, [currentProfile?.id, currentProfile?.name])

  // ── Check Ollama on mount ──
  useEffect(() => {
    checkAiSource()
  }, [])

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, interimText])

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
      setShowSetup(false) // Keep UI clean
    }
  }

  // ── Helper: build a message object ──
  function buildMessage(role, content, meta = {}) {
    return { role, content, id: `${Date.now()}-${Math.random()}`, ...meta }
  }

  function greetingText(name) {
    return `Hi ${name || 'Explorer'}! 👋 I'm **NeuroLex**, your AI learning buddy!\n\nI can help you explore **Maths 🔢**, **English 📖**, **Science 🔬**, and play fun learning quizzes. You can type, speak, or click any of the prompt buttons below! 🌟`
  }

  // ──────────────────────────────────────────────
  // Route to AI backend
  // ──────────────────────────────────────────────
  async function sendToAI(msgHistory, userMessage) {
    const contextMessages = msgHistory.slice(-8)
    const activeKey = getGeminiApiKey()

    if (aiSource === 'ollama') {
      try {
        const result = await sendLocalLLMMessage(contextMessages, userMessage, {
          model: ollamaModel,
          difficultyLevel: diffLevel,
        })
        if (result?.text) return result.text
      } catch (err) {
        console.warn('Ollama error, falling back to smart engine:', err)
      }
    }

    if ((aiSource === 'gemini' || activeKey) && navigator.onLine) {
      try {
        const geminiReply = await sendGeminiMessage(contextMessages, userMessage, activeKey)
        if (geminiReply) return geminiReply
      } catch (err) {
        console.warn('Gemini error, falling back to smart engine:', err)
      }
    }

    // Direct multi-subject intelligent engine
    return getSmartSubjectAnswer(userMessage)
  }

  // ──────────────────────────────────────────────
  // Voice command handlers
  // ──────────────────────────────────────────────
  async function handleVoiceCommand(intent, raw, msgHistory) {
    switch (intent) {
      case INTENTS.START_LESSON: {
        const lessons = getAllLessons()
        const first = lessons[0]
        if (!first) return "I don't have any lessons loaded right now. Try asking a question! 📚"
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
        if (!next) return "🎉 Amazing! You've finished all lessons in this topic! Try a quiz or start a new subject!"
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
        if (!prev) return "You're at the very first lesson! Keep going! 💪"
        setCurrLesson(prev)
        if (currentProfile?.id) setCurrentLesson(currentProfile.id, prev.id)
        return formatLessonReply(prev)
      }

      case INTENTS.START_QUIZ: {
        navigate('/quiz/math')
        return "Opening the quiz page for you! 🎯 Good luck!"
      }

      case INTENTS.REPEAT: {
        if (!lastBotMsg) return "There's nothing to repeat yet! Ask me a question first. 😊"
        return lastBotMsg
      }

      case INTENTS.READ_THIS: {
        if (!currentLesson) return "Start a lesson first by saying 'Start lesson' so I can read it! 📖"
        return `Let me read the lesson for you! 🔊\n\n${currentLesson.content}`
      }

      case INTENTS.EXPLAIN_THIS: {
        if (!currentLesson) {
          return await sendToAI(msgHistory, "Can you explain what we just talked about in a simpler way?")
        }
        return await sendToAI(msgHistory, `Please explain "${currentLesson.title}" with a fun real-life example.`)
      }

      case INTENTS.MAKE_EASIER: {
        setDiffLevel('easy')
        const simpler = await sendToAI(
          msgHistory,
          lastBotMsg
            ? `Please explain that again but even simpler. Use very short sentences and basic words only.`
            : `Explain in the simplest possible way.`
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
        return `Let's level up! 💪 Here is a more detailed version:\n\n${harder}`
      }

      case INTENTS.SHOW_PROGRESS: {
        const pts = currentProfile?.points || 0
        const lvl = currentProfile?.level || 1
        const badges = currentProfile?.badges || []
        const lessonProg = currentProfile?.id ? getLessonProgress(currentProfile.id) : {}
        const completedLessons = Object.keys(lessonProg).length

        return `Here's your progress, **${currentProfile?.name || 'Explorer'}**! 🌟\n\n⭐ Points: **${pts}**\n🏆 Level: **${lvl}**\n📚 Completed Lessons: **${completedLessons}**\n🏅 Badges: **${badges.length > 0 ? badges.join(', ') : 'Keep learning to earn badges!'}**\n\nYou're doing amazing! Keep going! 💪`
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
        return `நல்லது! 🌟 இப்போது நான் தமிழில் பேசுவேன்!\n(Good! I'll now respond in Tamil!)`
      }

      case INTENTS.HELP_ME: {
        const cmdList = VOICE_COMMAND_HELP.map(c => `${c.command} → ${c.action}`).join('\n')
        return `Here are the voice commands you can use! 🎤\n\n${cmdList}\n\nYou can also just ask me any question! 😊`
      }

      default:
        return await sendToAI(msgHistory, raw)
    }
  }

  function formatLessonReply(lesson) {
    return `📖 **${lesson.emoji} ${lesson.title}** (${lesson.subject} — Level ${lesson.level})\n\n${lesson.content}\n\n---\n💡 **Activity:** ${lesson.activity}\n\nSay "Next lesson" to continue or "Explain this" for more help! 🌟`
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

    let reply = ''
    try {
      const { intent, raw } = detectIntent(msg)
      if (intent !== INTENTS.FREE_QUESTION) {
        reply = await handleVoiceCommand(intent, raw, updated)
      } else {
        reply = await sendToAI(updated, msg)
      }
    } catch (err) {
      console.error('Chat error:', err)
      reply = getSmartSubjectAnswer(msg)
    }

    if (!reply) {
      reply = getSmartSubjectAnswer(msg)
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

    // TTS Speak
    if (settings?.ttsEnabled !== false) {
      try {
        setVoiceState('speaking')
        const ttsLang = isTamil ? 'ta-IN' : lang
        speak(reply, settings?.speechRate || 0.85, ttsLang)
        const words = reply.split(' ').length
        setTimeout(() => setVoiceState('idle'), Math.min(words * 350, 8000))
      } catch (e) {
        setVoiceState('idle')
      }
    }
  }, [messages, input, aiSource, ollamaModel, diffLevel, currentLesson, isTamil, settings, lang, currentProfile, addPoints])

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

  const speakMsg = (content) => {
    if (!isTTSAvailable()) return
    setVoiceState('speaking')
    speak(content, settings?.speechRate || 0.85, isTamil ? 'ta-IN' : lang)
    const words = content.split(' ').length
    setTimeout(() => setVoiceState('idle'), Math.min(words * 350, 8000))
  }

  function formatContent(content) {
    const lines = content.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('# ')) {
        return <h3 key={i} style={{ margin: '8px 0 4px', color: '#818cf8', fontSize: '1.15rem' }}>{line.slice(2)}</h3>
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={i} style={{ display: 'block', margin: '6px 0 2px', color: '#f8fafc' }}>{line.slice(2, -2)}</strong>
      }
      if (line === '---') {
        return <hr key={i} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '10px 0' }} />
      }
      if (line.startsWith('• ')) {
        return <div key={i} style={{ margin: '3px 0 3px 12px', color: 'rgba(241,245,249,0.9)' }}>{line}</div>
      }
      if (line.startsWith('💡') || line.startsWith('⭐') || line.startsWith('🏆') || line.startsWith('📚') || line.startsWith('🏅') || line.startsWith('🍕') || line.startsWith('🌿') || line.startsWith('🪐')) {
        return <p key={i} style={{ margin: '6px 0', lineHeight: 1.6 }}>{line}</p>
      }
      return <span key={i}>{line}<br /></span>
    })
  }

  const isLoading = voiceState === 'processing'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a16', color: '#f8fafc', overflow: 'hidden' }}>

      {/* ── Top Header Bar ── */}
      <header
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(13, 13, 26, 0.92)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 0 20px rgba(99,102,241,0.5)',
              position: 'relative',
            }}
          >
            🤖
            <span
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid #0d0d1a',
                boxShadow: '0 0 8px #10b981',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Neuro<span className="gradient-text">Lex AI Tutor</span>
              </h2>
              <span
                style={{
                  fontSize: '0.70rem',
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontWeight: 700,
                }}
              >
                ● Active
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(241,245,249,0.55)' }}>
                Offline-First Multi-Subject Assistant
              </span>
              {isTamil && (
                <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 6, background: 'rgba(168,85,247,0.2)', color: '#c084fc' }}>
                  தமிழ்
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Difficulty Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              padding: 3,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {[
              { id: 'easy', label: '🌱 Simple' },
              { id: 'normal', label: '⚡ Standard' },
              { id: 'hard', label: '🚀 Challenge' }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDiffLevel(d.id)}
                style={{
                  background: diffLevel === d.id ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                  border: diffLevel === d.id ? '1px solid rgba(99, 102, 241, 0.5)' : 'none',
                  color: diffLevel === d.id ? '#ffffff' : 'rgba(241,245,249,0.6)',
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Quick Voice Command Cheat Toggle */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowCommands(!showCommands)}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            🎤 Commands
          </button>

          {/* Stop Voice */}
          {voiceState === 'speaking' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { stopSpeaking(); setVoiceState('idle') }}
              style={{ fontSize: '0.78rem', padding: '6px 12px', borderColor: '#ef4444', color: '#f87171' }}
            >
              🔇 Stop
            </button>
          )}

          {/* Clear Chat */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleClear}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            title="Clear Chat History"
          >
            🗑️ Clear
          </button>
        </div>
      </header>

      {/* ── Voice Commands Tray ── */}
      {showCommands && (
        <div
          className="animate-fadeIn"
          style={{
            padding: '14px 24px',
            background: 'rgba(99, 102, 241, 0.08)',
            borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#818cf8' }}>
              🎤 Try speaking or clicking any voice command:
            </span>
            <button
              onClick={() => setShowCommands(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(241,245,249,0.5)', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {VOICE_COMMAND_HELP.map(c => (
              <button
                key={c.command}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                onClick={() => {
                  setShowCommands(false)
                  sendMessage(c.command.replace(/"/g, ''))
                }}
              >
                {c.command}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Messages Feed ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
        className="scrollbar-hide"
      >
        {/* Welcome Card if first message */}
        {messages.length <= 1 && (
          <div
            className="glass-card animate-fadeInUp"
            style={{
              padding: '24px',
              borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.06) 100%)',
              border: '1px solid rgba(99,102,241,0.2)',
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 32 }}>✨</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>
                  Welcome to NeuroLex AI Tutor!
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'rgba(241,245,249,0.7)' }}>
                  Your patient, step-by-step companion for grades K-5.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 14 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
                <strong style={{ color: '#818cf8', fontSize: '0.85rem' }}>🔢 Instant Math</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'rgba(241,245,249,0.6)' }}>
                  Addition, subtraction, multiplication & fractions
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
                <strong style={{ color: '#34d399', fontSize: '0.85rem' }}>📖 Phonics & Grammar</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'rgba(241,245,249,0.6)' }}>
                  Vowels, nouns, verbs, rhymes & opposites
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
                <strong style={{ color: '#f59e0b', fontSize: '0.85rem' }}>🔬 World & Science</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'rgba(241,245,249,0.6)' }}>
                  Plants, planets, human body & water cycle
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Messages Stream */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="animate-fadeInUp"
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: 12,
              alignItems: 'flex-start',
            }}
          >
            {/* Avatar */}
            {msg.role === 'assistant' ? (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  boxShadow: '0 0 12px rgba(99,102,241,0.4)',
                }}
              >
                🤖
              </div>
            ) : (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                }}
              >
                {currentProfile?.avatar || '🦊'}
              </div>
            )}

            {/* Bubble Content */}
            <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
                style={{
                  padding: '14px 18px',
                  borderRadius: 18,
                  fontSize: '0.94rem',
                  lineHeight: 1.65,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                }}
              >
                {formatContent(msg.content)}
              </div>

              {/* Quick Assistant Actions */}
              {msg.role === 'assistant' && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', paddingLeft: 4 }}>
                  <button
                    onClick={() => speakMsg(msg.content)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '3px 8px', fontSize: '0.72rem', borderRadius: 8 }}
                    title="Read Aloud"
                  >
                    🔊 Listen
                  </button>
                  <button
                    onClick={() => sendMessage('Can you make that simpler for me?')}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '3px 8px', fontSize: '0.72rem', borderRadius: 8 }}
                    title="Simpler Explanation"
                  >
                    🌱 Simpler
                  </button>
                  <button
                    onClick={() => sendMessage('Tell me more about that!')}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '3px 8px', fontSize: '0.72rem', borderRadius: 8 }}
                    title="More Detail"
                  >
                    🚀 More Detail
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="animate-fadeIn" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              🤖
            </div>
            <div
              className="chat-bubble-ai"
              style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '12px 18px', borderRadius: 18 }}
            >
              <span style={{ fontSize: '0.82rem', color: 'rgba(241,245,249,0.7)', marginRight: 4 }}>
                NeuroLex is thinking…
              </span>
              {[0, 1, 2].map(n => (
                <div
                  key={n}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#818cf8',
                    animation: 'float 1.2s ease-in-out infinite',
                    animationDelay: `${n * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Categorized Subject Prompts Tray ── */}
      <div
        style={{
          padding: '10px 24px 6px',
          background: 'rgba(13, 13, 26, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }} className="scrollbar-hide">
            {SUBJECT_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id)
                  setShowPromptsTray(true)
                }}
                style={{
                  background: activeCategory === cat.id ? 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(168,85,247,0.35))' : 'rgba(255,255,255,0.04)',
                  border: activeCategory === cat.id ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)',
                  color: activeCategory === cat.id ? '#ffffff' : 'rgba(241,245,249,0.7)',
                  borderRadius: 20,
                  padding: '5px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  boxShadow: activeCategory === cat.id ? '0 0 14px rgba(99,102,241,0.3)' : 'none',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowPromptsTray(!showPromptsTray)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(241,245,249,0.5)',
              fontSize: '0.74rem',
              cursor: 'pointer',
              fontWeight: 600,
              padding: '4px 6px',
            }}
          >
            {showPromptsTray ? 'Hide ✕' : '💡 Prompts'}
          </button>
        </div>

        {/* Prompt Chips */}
        {showPromptsTray && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 8,
              paddingTop: 2,
            }}
            className="scrollbar-hide"
          >
            {(CATEGORIZED_PROMPTS[activeCategory] || CATEGORIZED_PROMPTS.all).map(p => (
              <button
                key={p.text}
                onClick={() => sendMessage(p.text)}
                disabled={isLoading}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 14,
                  padding: '7px 14px',
                  color: '#f8fafc',
                  fontSize: '0.80rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.2)'
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Input Box & Voice Controls ── */}
      <div
        style={{
          padding: '14px 24px 20px',
          background: 'rgba(10, 10, 22, 0.98)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Interim Speech Transcript */}
        {interimText && (
          <div
            style={{
              fontSize: '0.82rem',
              color: '#818cf8',
              marginBottom: 8,
              fontStyle: 'italic',
              paddingLeft: 6,
            }}
          >
            🎤 Hearing: "{interimText}"
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Voice Orb */}
          <VoiceOrb
            state={voiceState === 'processing' ? 'processing' : voiceState}
            onClick={handleVoiceInput}
            size={48}
            disabled={isLoading && voiceState !== 'speaking'}
          />

          {/* Text Input */}
          <input
            ref={inputRef}
            className="input"
            placeholder={
              voiceState === 'listening'
                ? '🎤 Listening to your voice…'
                : 'Ask anything about Maths (15 + 8), English, Science, or type a question…'
            }
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !isLoading && sendMessage()}
            disabled={isLoading || voiceState === 'listening'}
            style={{
              flex: 1,
              fontSize: '0.94rem',
              padding: '14px 20px',
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1.5px solid rgba(255, 255, 255, 0.12)',
            }}
          />

          {/* Send Button */}
          <button
            className="btn btn-primary"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              padding: 0,
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </div>
  )
}
