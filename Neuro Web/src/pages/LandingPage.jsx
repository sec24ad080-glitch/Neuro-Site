import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Navbar from '../components/Navbar.jsx'
import HeroIllustration from '../components/HeroIllustration.jsx'
import { speak, stopSpeaking, isTTSAvailable, startListening, isSTTAvailable } from '../services/tts.js'

const LANDING_TEXT = {
  en: {
    heroTag: 'Offline-First AI Learning for Neurodiverse K-5 Students',
    titleSuffix: 'Learning in Your Own Way',
    heroDesc: 'An offline, AI-powered adaptive learning assistant specifically engineered for neurodiverse K-5 children — including learners with autism, ADHD, dyslexia, and unique cognitive styles. Multimodal audio-visual lessons, voice feedback, and calming gamification without distraction.',
    startBtn: '🚀 Start Learning Free',
    exploreBtn: 'Explore Features ↓',
    trust1: '100% Offline-First',
    trust2: 'Zero Tracking & Ad-Free',
    trust3: 'UN SDG 4 Aligned',
    trust4: 'Dyslexia-Friendly Font',
  },
  ta: {
    heroTag: 'K-5 குழந்தைகளுக்கு 100% ஆஃப்லைன் AI கற்றல் தளம்',
    titleSuffix: 'உங்கள் சொந்த வேகத்தில் கற்கலாம்',
    heroDesc: 'ஆட்டிசம், ஏடிஎச்டி, டிஸ்லெக்சியா மற்றும் தனித்துவமான கற்றல் தேவைகள் கொண்ட K-5 மாணவர்களுக்கான இணையமற்ற பாதுகாப்பான AI கற்றல் உதவி மையம்.',
    startBtn: '🚀 இலவசமாக தொடங்கவும்',
    exploreBtn: 'அம்சங்களை காண்க ↓',
    trust1: '100% ஆஃப்லைன்',
    trust2: 'விளம்பரங்கள் இல்லை',
    trust3: 'UN SDG 4 தரம்',
    trust4: 'டிஸ்லெக்சியா எழுத்துரு',
  },
  hi: {
    heroTag: 'न्यूरोडाइवर्स बच्चों के लिए 100% ऑफलाइन AI शिक्षा',
    titleSuffix: 'अपनी खुद की शैली में सीखें',
    heroDesc: 'ऑटिज़्म, एडीएचडी, डिस्लेक्सिया और विशेष शिक्षण आवश्यकताओं वाले ग्रेड K-5 के बच्चों के लिए विशेष रूप से निर्मित ऑफलाइन AI शिक्षण सहायक।',
    startBtn: '🚀 मुफ़्त में सीखना शुरू करें',
    exploreBtn: 'विशेषताएं देखें ↓',
    trust1: '100% ऑफलाइन',
    trust2: 'विज्ञापन रहित',
    trust3: 'UN SDG 4 संरेखित',
    trust4: 'डिस्लेक्सिया-अनुकूल फ़ॉन्ट',
  }
}

export default function LandingPage() {
  const { currentProfile, settings, updateSettings, showNotification, setBloomMode } = useApp()
  const navigate = useNavigate()

  // Interactive Voice Demo state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [activeVoiceTab, setActiveVoiceTab] = useState('tts') // 'tts' or 'stt'
  const [demoText, setDemoText] = useState("Hello! I am NeuroLite. Let's explore science and math together at your own speed!")
  const [isListeningSTT, setIsListeningSTT] = useState(false)
  const [sttResult, setSttResult] = useState('')
  const sttRecognitionRef = useRef(null)
  const [activeSubjectTab, setActiveSubjectTab] = useState('math')
  const [contactSubmitted, setContactSubmitted] = useState(false)
  const [faqOpen, setFaqOpen] = useState(null)

  const langKey = settings?.language in LANDING_TEXT ? settings.language : 'en'
  const txt = LANDING_TEXT[langKey]

  const handleStartLearning = () => {
    if (currentProfile) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  const handlePlayVoiceDemo = (textToSpeak) => {
    if (isPlayingAudio) {
      stopSpeaking()
      setIsPlayingAudio(false)
      return
    }

    if (!isTTSAvailable()) {
      showNotification('Web Speech API is not supported in this browser.', 'error')
      return
    }

    setIsPlayingAudio(true)
    const utterance = speak(textToSpeak || demoText, settings.speechRate || 0.85, 'en-US')
    if (utterance) {
      utterance.onend = () => setIsPlayingAudio(false)
      utterance.onerror = () => setIsPlayingAudio(false)
    } else {
      setTimeout(() => setIsPlayingAudio(false), 3000)
    }
  }

  const handleStartMicDemo = () => {
    if (isListeningSTT) {
      sttRecognitionRef.current?.stop()
      setIsListeningSTT(false)
      return
    }
    if (!isSTTAvailable()) {
      showNotification('Web Speech recognition is not supported in this browser.', 'error')
      return
    }
    setIsListeningSTT(true)
    setSttResult('Listening... Please speak into your microphone!')
    sttRecognitionRef.current = startListening(
      (finalText) => {
        setSttResult(`Recognized: "${finalText}" 🌟`)
        setIsListeningSTT(false)
      },
      (interimText) => {
        setSttResult(`Hearing: "${interimText}..."`)
      },
      () => {
        setIsListeningSTT(false)
      }
    )
  }

  const sampleSubjects = [
    { id: 'math', name: 'Mathematics', icon: '🔢', color: '#6366f1', sample: 'Counting to 10 & visual addition: 2 apples 🍎🍎 + 3 apples 🍎🍎🍎 = 5 apples!' },
    { id: 'english', name: 'English', icon: '📖', color: '#f59e0b', sample: 'Phonics, word sounds, and vocabulary matching with joyful emoji associations.' },
    { id: 'science', name: 'Science', icon: '🔬', color: '#10b981', sample: 'How plants drink water and solar system planets explained in calm, bite-sized facts.' },
    { id: 'social_studies', name: 'Social Studies', icon: '🗺️', color: '#ec4899', sample: 'Maps, community helpers, and everyday social routines explained with visuals.' },
    { id: 'memory', name: 'Memory & Focus', icon: '🧠', color: '#8b5cf6', sample: 'Sequence recall games and attention exercises that adapt to your focus streak.' },
  ]

  const workflowSteps = [
    { num: '01', title: 'Student', role: 'Learner', icon: '👤', desc: 'Select or create your child-friendly avatar profile without passwords.' },
    { num: '02', title: 'Choose Subject', role: 'Focus', icon: '📚', desc: 'Pick from Math, English, Science, Social Studies, or Memory games.' },
    { num: '03', title: 'Learn', role: 'Bite-Sized', icon: '💡', desc: 'Engage with visual concept cards and synchronized audio read-aloud.' },
    { num: '04', title: 'Practice', role: 'Interactive', icon: '✍️', desc: 'Answer questions using touch, keyboard, or voice dictation.' },
    { num: '05', title: 'Quiz / Game', role: 'Reinforce', icon: '🎮', desc: 'Play Math Speed Run or Word Match cards to solidify understanding.' },
    { num: '06', title: 'AI Feedback', role: 'Encouraging', icon: '🤖', desc: 'Get gentle, patient hints with zero negative frustration triggers.' },
    { num: '07', title: 'Adaptive Difficulty', role: 'Smart Tuning', icon: '⚡', desc: 'Question difficulty scales smoothly between easy, normal, and hard.' },
    { num: '08', title: 'Track Progress', role: 'Celebration', icon: '🏆', desc: 'Earn XP, stars, unlock achievement badges, and view Parent summaries.' },
  ]

  const faqs = [
    {
      q: 'Does NeuroLite really work completely offline?',
      a: 'Yes! All core lessons, question banks, gamified quizzes, speech synthesis, and local storage run 100% on the device. For advanced conversational tutoring, you can even connect local Ollama models (Gemma 2B, Phi-3, TinyLlama) with zero cloud calls.'
    },
    {
      q: 'How does NeuroLite assist students with Autism and ADHD?',
      a: 'NeuroLite eliminates sensory overload through predictable layouts, gentle color palettes, clear visual structure, bite-sized tasks, and rewarding micro-achievements that sustain dopamine without stressful time penalties.'
    },
    {
      q: 'How does it help students with Dyslexia?',
      a: 'Students can toggle a high-legibility Dyslexia-friendly font mode, activate synchronized Text-to-Speech (TTS) audio narration, and respond through voice dictation (STT) without getting stuck on spelling barriers.'
    },
    {
      q: 'Can parents and teachers monitor the child\'s learning journey?',
      a: 'Yes. NeuroLite includes a dedicated Parent & Teacher View that summarizes total learning time, subject accuracy percentages, recent activity logs, and earned achievement badges.'
    },
    {
      q: 'Is any personal data or student voice recording uploaded to the internet?',
      a: 'No. All child profiles, scores, and speech processing remain strictly on the local device browser or local machine storage. NeuroLite is built privacy-first by design.'
    }
  ]

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Parent of autistic child, Grade 2',
      avatar: '👩‍👧',
      color: '#6366f1',
      stars: 5,
      text: 'My daughter used to cry before every homework session. After two weeks with NeuroLite, she actually asks to study. The calm colors and the voice reading make everything feel safe for her.',
    },
    {
      name: 'Marcus Williams',
      role: 'Special Education Teacher',
      avatar: '👨‍🏫',
      color: '#10b981',
      stars: 5,
      text: 'I\'ve tried dozens of EdTech tools. NeuroLite is the first one built with genuine understanding of neurodiverse needs. The adaptive difficulty and offline capability make it usable in any classroom.',
    },
    {
      name: 'Sita Anand',
      role: 'Parent of child with ADHD, Grade 3',
      avatar: '👩‍👦',
      color: '#f59e0b',
      stars: 5,
      text: 'The bite-sized lessons and instant rewards keep my son engaged for 20-30 minutes — previously impossible. His math accuracy jumped from 40% to 78% in just one month!',
    },
    {
      name: 'Dr. James Okafor',
      role: 'Child Psychologist & Learning Specialist',
      avatar: '👨‍⚕️',
      color: '#a855f7',
      stars: 5,
      text: 'The absence of countdown timers, judgmental error sounds, or social comparison is remarkable. NeuroLite creates a psychologically safe learning environment that I actively recommend.',
    },
    {
      name: 'Mei Lin Chen',
      role: 'Parent of child with Dyslexia, Grade 4',
      avatar: '👩‍💻',
      color: '#ec4899',
      stars: 5,
      text: 'The dyslexic font toggle and voice read-aloud changed everything. My son can finally read lesson text independently without getting frustrated by spelling. Truly life-changing.',
    },
    {
      name: 'Ravi Patel',
      role: 'School Principal, Inclusive Ed Advocate',
      avatar: '🧑‍💼',
      color: '#06b6d4',
      stars: 5,
      text: 'We deployed NeuroLite in 3 classrooms. Offline capability is a game-changer for our area. Teacher feedback was unanimous: student engagement and confidence have measurably improved.',
    },
  ]

  const impactStats = [
    { num: '5', suffix: '+', label: 'Subjects Covered', icon: '📚', color: '#6366f1' },
    { num: '200', suffix: '+', label: 'Learning Questions', icon: '❓', color: '#a855f7' },
    { num: '100', suffix: '%', label: 'Offline First', icon: '📴', color: '#10b981' },
    { num: '4', suffix: '+', label: 'Neurotype Supports', icon: '🧩', color: '#f59e0b' },
    { num: '3', suffix: '+', label: 'Accessibility Modes', icon: '♿', color: '#ec4899' },
    { num: '0', suffix: '$', label: 'Cost to Students', icon: '💚', color: '#06b6d4' },
  ]

  // Track sections for animation mode
  const sectionRefs = useRef({})
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id
          if (id === 'hero') setBloomMode('hero')
          else if (id === 'how-it-works') setBloomMode('how-it-works')
          else if (id === 'voice-learning') setBloomMode('voice')
          else if (id === 'benefits' || id === 'about') setBloomMode('adaptive')
        }
      })
    }, { threshold: 0.4 })

    Object.values(sectionRefs.current).forEach(node => {
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [setBloomMode])

  // Scroll-reveal: add 'revealed' class when elements enter viewport
  useEffect(() => {
    // Small delay to ensure DOM is fully painted before querying
    const timer = setTimeout(() => {
      const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')

      // Safety fallback: reveal ALL elements after 1.5s in case observer doesn't fire
      const fallback = setTimeout(() => {
        reveals.forEach(el => el.classList.add('revealed'))
      }, 1500)

      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed')
            }
          })
        },
        { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
      )

      reveals.forEach(el => {
        // Immediately reveal elements already visible in viewport
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('revealed')
        } else {
          revealObserver.observe(el)
        }
      })

      return () => {
        clearTimeout(fallback)
        revealObserver.disconnect()
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [])

  const addRef = (id) => (el) => {
    if (el) sectionRefs.current[id] = el
  }

  return (
    <div className="landing-page-root" style={{ minHeight: '100vh', background: 'transparent' }}>
      {/* Navbar */}
      <Navbar />

      {/* ── SECTION 1: HERO ── */}
      <section
        id="hero"
        ref={addRef('hero')}
        style={{
          position: 'relative',
          padding: '60px 20px 80px',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow backgrounds */}
        <div
          style={{
            position: 'absolute',
            top: '5%',
            left: '10%',
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '20%',
            right: '8%',
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.15fr 0.85fr',
              gap: 48,
              alignItems: 'center',
            }}
            className="hero-grid"
          >
            {/* Left Column: Headline & Pitch */}
            <div className="animate-fadeInUp">
              {/* Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 999,
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  marginBottom: 20,
                }}
              >
                <span style={{ fontSize: '1rem' }}>🌟</span>
                <span
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: 'var(--indigo-lt)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {txt.heroTag}
                </span>
              </div>

              {/* Tagline & Main Title */}
              <h1
                style={{
                  fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
                  fontWeight: 900,
                  lineHeight: 1.12,
                  marginBottom: 16,
                  letterSpacing: '-0.02em',
                }}
              >
                Neuro<span className="gradient-text">Lite</span>
                <br />
                <span
                  style={{
                    fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)',
                    fontWeight: 700,
                    color: '#f8fafc',
                    display: 'block',
                    marginTop: 8,
                  }}
                >
                  {txt.titleSuffix}
                </span>
              </h1>

              {/* Short Description */}
              <p
                style={{
                  fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                  lineHeight: 1.7,
                  color: 'rgba(241,245,249,0.78)',
                  marginBottom: 32,
                  maxWidth: 580,
                }}
              >
                {txt.heroDesc}
              </p>

              {/* CTAs */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 14,
                  alignItems: 'center',
                  marginBottom: 36,
                }}
              >
                <button
                  onClick={handleStartLearning}
                  className="btn btn-primary btn-lg glow-indigo"
                  style={{
                    fontWeight: 700,
                    boxShadow: '0 8px 30px rgba(99,102,241,0.45)',
                  }}
                >
                  {txt.startBtn}
                </button>
                <a
                  href="#features"
                  className="btn btn-secondary btn-lg"
                  style={{
                    fontWeight: 600,
                  }}
                >
                  {txt.exploreBtn}
                </a>
              </div>

              {/* Trust Indicators */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 18,
                  paddingTop: 20,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {[txt.trust1, txt.trust2, txt.trust3, txt.trust4].map((t) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: 'rgba(241,245,249,0.65)' }}>
                    <span style={{ color: '#10b981' }}>✓</span> {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Hero Illustration & Interactive Showcase */}
            <div className="animate-fadeInUp delay-2">
              <HeroIllustration />
              <div
                className="glass-card"
                style={{
                  padding: '24px 26px',
                  borderRadius: 24,
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(20,20,40,0.85) 100%)',
                  border: '1.5px solid rgba(99,102,241,0.25)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                  position: 'relative',
                }}
              >
                {/* Floating Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: -12,
                    right: 24,
                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                    color: '#ffffff',
                    padding: '4px 14px',
                    borderRadius: 999,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
                  }}
                >
                  ⚡ LIVE INTERACTIVE PREVIEW
                </div>

                {/* Profile Header simulation */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                    paddingBottom: 14,
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                      }}
                    >
                      {currentProfile?.avatar || '🦊'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                        {currentProfile ? currentProfile.name : 'Leo — Grade 2'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(241,245,249,0.5)' }}>
                        Level 2 Explorer · 240 XP
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-indigo">Adaptive Mode: Active</span>
                </div>

                {/* Subject Selector Tabs */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
                  {sampleSubjects.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSubjectTab(s.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 10,
                        border: '1px solid',
                        borderColor: activeSubjectTab === s.id ? s.color : 'rgba(255,255,255,0.08)',
                        background: activeSubjectTab === s.id ? `${s.color}25` : 'rgba(255,255,255,0.03)',
                        color: activeSubjectTab === s.id ? '#ffffff' : 'rgba(241,245,249,0.6)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s',
                      }}
                    >
                      <span>{s.icon}</span>
                      <span>{s.name}</span>
                    </button>
                  ))}
                </div>

                {/* Sample Card */}
                {sampleSubjects
                  .filter((s) => s.id === activeSubjectTab)
                  .map((s) => (
                    <div
                      key={s.id}
                      style={{
                        background: `radial-gradient(ellipse at top left, ${s.color}15 0%, rgba(255,255,255,0.02) 80%)`,
                        border: `1px solid ${s.color}35`,
                        borderRadius: 16,
                        padding: '18px 20px',
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: s.color, textTransform: 'uppercase' }}>
                          Adaptive Lesson Concept
                        </span>
                        <span className="badge badge-green">Calm Pacing</span>
                      </div>
                      <p style={{ fontSize: '0.92rem', color: '#f1f5f9', lineHeight: 1.6, marginBottom: 14 }}>
                        {s.sample}
                      </p>

                      {/* Interactive TTS listen button */}
                      <button
                        onClick={() => handlePlayVoiceDemo(s.sample)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          background: isPlayingAudio ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)',
                          borderColor: isPlayingAudio ? 'var(--indigo)' : 'rgba(255,255,255,0.12)',
                          color: '#f8fafc',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: '1.1rem' }}>{isPlayingAudio ? '🔊' : '🗣️'}</span>
                        <span>{isPlayingAudio ? 'Speaking aloud... (Click to stop)' : 'Listen to this lesson'}</span>
                      </button>
                    </div>
                  ))}

                {/* Voice & Adaptive Feedback simulator */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 14,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: 'rgba(99,102,241,0.2)',
                        color: 'var(--indigo-lt)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                      }}
                    >
                      🎤
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>
                        Voice Response & Feedback
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(241,245,249,0.5)' }}>
                        Speech-to-Text active · No typing required
                      </div>
                    </div>
                  </div>

                  {/* Audio Wave Bars */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {[14, 22, 12, 28, 16, 24, 10].map((h, i) => (
                      <span
                        key={i}
                        style={{
                          width: 3,
                          height: isPlayingAudio ? `${h}px` : '8px',
                          borderRadius: 2,
                          background: isPlayingAudio
                            ? 'linear-gradient(to top, #6366f1, #a855f7)'
                            : 'rgba(255,255,255,0.2)',
                          transition: 'height 0.2s ease',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: KEY BENEFITS ── */}
      <section
        id="benefits"
        ref={addRef('benefits')}
        style={{
          padding: '70px 20px',
          background: 'linear-gradient(180deg, rgba(13,13,26,0.2) 0%, rgba(17,17,40,0.4) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 48px' }}>
            <span className="badge badge-indigo" style={{ marginBottom: 12 }}>
              Why NeuroLite Works
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBottom: 12 }}>
              Built From the Ground Up for <span className="gradient-text">Neurodiverse Learners</span>
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(241,245,249,0.65)' }}>
              Standard educational apps often trigger cognitive overload. NeuroLite is
              carefully structured to create a calm, dignified, and empowering environment.
            </p>
          </div>

          <div className="grid-3" style={{ gap: 24 }}>
            {[
              {
                icon: '🎯',
                color: '#6366f1',
                title: 'Personalized Pace',
                desc: 'Never rushed by timers or stressful buzzers. Lessons and practice adapt seamlessly to each child’s processing speed and attention rhythm.',
              },
              {
                icon: '🎧',
                color: '#a855f7',
                title: 'Multi-Sensory Audio-Visual',
                desc: 'Synchronized Web Speech text-to-speech, speech-to-text voice answers, visual icons, and colors reinforce concept retention for varied neurotypes.',
              },
              {
                icon: '🌿',
                color: '#10b981',
                title: 'Distraction-Free Calm Space',
                desc: 'Soft color palettes, zero ads, no autoplaying popups, and dedicated Dyslexia-friendly typography toggle to eliminate sensory strain.',
              },
              {
                icon: '📴',
                color: '#06b6d4',
                title: '100% Offline-First Learning',
                desc: 'All lessons, quizzes, question banks, and progress tracking function without internet connectivity. Perfect for low-bandwidth zones and safe offline use.',
              },
              {
                icon: '⭐',
                color: '#f59e0b',
                title: 'Positive Reinforcement',
                desc: 'Gamification designed around celebration: XP stars, levels, badges, and learning streaks that build genuine self-efficacy and resilience.',
              },
              {
                icon: '👨‍👩‍👧',
                color: '#ec4899',
                title: 'Parent & Educator Insights',
                desc: 'Dedicated parent view with detailed subject breakdown, answer accuracy, and activity timestamps to guide individualized support.',
              },
            ].map((b, i) => (
              <div
                key={b.title}
                className="glass-card"
                style={{
                  padding: '30px 26px',
                  borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  transition: 'all 0.3s ease',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: `${b.color}20`,
                    border: `1.5px solid ${b.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    marginBottom: 20,
                  }}
                >
                  {b.icon}
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 10, color: '#f8fafc' }}>
                  {b.title}
                </h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'rgba(241,245,249,0.7)', margin: 0 }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: ABOUT NEUROLITE ── */}
      <section
        id="about"
        ref={addRef('about')}
        style={{
          padding: '80px 20px',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 48,
              alignItems: 'center',
            }}
            className="about-grid"
          >
            <div>
              <span className="badge badge-purple" style={{ marginBottom: 14 }}>
                Our Mission & Purpose
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.6rem)', marginBottom: 18, lineHeight: 1.2 }}>
                Empowering Neurodiverse K-5 Minds with <span className="gradient-text">Adaptive AI</span>
              </h2>
              <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: 'rgba(241,245,249,0.85)', marginBottom: 20 }}>
                Every child processes the world uniquely. Traditional classrooms and one-size-fits-all digital products often isolate children with autism, ADHD, and dyslexia through excessive text, timed stress, and sensory clutter.
              </p>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'rgba(241,245,249,0.7)', marginBottom: 26 }}>
                <strong>NeuroLite</strong> helps neurodiverse K-5 students learn through personalized, adaptive, accessible, and engaging learning experiences. By combining offline speech synthesis, interactive visual modules, and flexible difficulty scaling, we provide an encouraging sanctuary where children gain true mastery at their own pace.
              </p>

              {/* 7 Pillars checklist */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {[
                  'Adaptive learning engine',
                  'Visual learning & associations',
                  'Text-to-Speech (TTS) narration',
                  'Speech-to-Text (STT) voice answers',
                  'Educational interactive games',
                  'Progress tracking & parent views',
                  'Offline-first zero cloud barrier',
                  'Inclusive SDG 4 Quality Education',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#f1f5f9' }}>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Neurodiversity Accommodation Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  type: 'Autism Spectrum Support',
                  emoji: '🧩',
                  color: '#6366f1',
                  bullets: [
                    'Predictable step-by-step navigation without sudden transitions.',
                    'Clear emoji-coded categories with literal, unambiguous explanations.',
                    'Gentle audio narration that avoids shouting or sudden alarm noises.',
                  ],
                },
                {
                  type: 'ADHD & Executive Function',
                  emoji: '⚡',
                  color: '#f59e0b',
                  bullets: [
                    'Chunked bite-sized questions that reduce cognitive overwhelm.',
                    'Interactive mini-games and quick feedback loops that maintain healthy engagement.',
                    'Voice interaction options for kinesthetic, hands-free answering.',
                  ],
                },
                {
                  type: 'Dyslexia & Phonics Processing',
                  emoji: '📖',
                  color: '#10b981',
                  bullets: [
                    'Built-in Dyslexia-friendly font toggle with optimized character weight.',
                    'Read-aloud question buttons to remove reading fatigue.',
                    'Visual word-to-emoji matching pairs to strengthen vocabulary without spelling stress.',
                  ],
                },
              ].map((card) => (
                <div
                  key={card.type}
                  className="glass-card"
                  style={{
                    padding: '22px 24px',
                    borderRadius: 18,
                    border: `1px solid ${card.color}35`,
                    background: `radial-gradient(ellipse at top left, ${card.color}10 0%, rgba(255,255,255,0.02) 70%)`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 26 }}>{card.emoji}</span>
                    <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#f8fafc' }}>{card.type}</h3>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 20, color: 'rgba(241,245,249,0.75)', fontSize: '0.86rem', lineHeight: 1.6 }}>
                    {card.bullets.map((b, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: FEATURES SECTION ── */}
      <section
        id="features"
        style={{
          padding: '80px 20px',
          background: 'linear-gradient(180deg, rgba(13,13,26,0.8) 0%, rgba(20,20,45,0.85) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
            <span className="badge badge-green" style={{ marginBottom: 12 }}>
              Verified Core Features
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.6rem)', marginBottom: 14 }}>
              Engineered for Complete <span className="gradient-text">Accessibility & Fun</span>
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(241,245,249,0.7)' }}>
              Explore the real features already integrated into NeuroLite’s offline platform.
              No placeholders or exaggerated promises — just working learning tools.
            </p>
          </div>

          <div className="grid-4" style={{ gap: 20 }}>
            {[
              {
                icon: '🧠',
                title: 'Adaptive Learning',
                color: '#6366f1',
                status: 'Implemented',
                desc: 'Dynamically shifts questions between Easy, Normal, and Hard based on streak counts and historical accuracy via adaptive.js.',
              },
              {
                icon: '🔊',
                title: 'Text-to-Speech',
                color: '#a855f7',
                status: 'Implemented',
                desc: 'Calm, native offline voice synthesis that reads question prompts, lesson descriptions, and encouraging feedback aloud.',
              },
              {
                icon: '🎤',
                title: 'Speech-to-Text',
                color: '#ec4899',
                status: 'Implemented',
                desc: 'Child-friendly voice recognition allows students to speak their answers and dictate sentences directly into the app.',
              },
              {
                icon: '🎮',
                title: 'Educational Games',
                color: '#10b981',
                status: 'Implemented',
                desc: 'Hands-on learning games including Math Speed Run and Word Match emoji card pairs with real-time score accumulation.',
              },
              {
                icon: '🖼️',
                title: 'Visual Learning',
                color: '#f59e0b',
                status: 'Implemented',
                desc: 'Rich emoji visual anchors, color-coded subjects, high contrast modes, and clean spacious typography tailored for neurodiversity.',
              },
              {
                icon: '⭐',
                title: 'Rewards & Progress',
                color: '#fbbf24',
                status: 'Implemented',
                desc: 'Gamified leveling system (200 XP/level), streak counters, and earned badges like "Expert", "Perfect Score", and "High Scorer".',
              },
              {
                icon: '🌐',
                title: 'Multilingual Learning',
                color: '#06b6d4',
                status: 'Implemented',
                desc: 'Integrated English and Tamil language translations for UI and offline lesson modules to support regional accessibility.',
              },
              {
                icon: '📴',
                title: 'Offline Learning',
                color: '#34d399',
                status: 'Implemented',
                desc: 'Runs completely offline using IndexedDB, localStorage, pre-packaged lessons, and optional local Ollama LLM integration.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="glass-card"
                style={{
                  padding: '24px 20px',
                  borderRadius: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: `1.5px solid ${f.color}30`,
                  background: 'rgba(255,255,255,0.03)',
                  transition: 'all 0.25s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: `${f.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 26,
                      }}
                    >
                      {f.icon}
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: 'rgba(16,185,129,0.18)',
                        color: '#34d399',
                        border: '1px solid rgba(16,185,129,0.3)',
                        fontSize: '0.68rem',
                      }}
                    >
                      ✓ {f.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', marginBottom: 8, color: '#f8fafc' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(241,245,249,0.7)', margin: 0 }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: HOW IT WORKS ── */}
      <section
        id="how-it-works"
        ref={addRef('how-it-works')}
        style={{
          padding: '80px 20px',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
            <span className="badge badge-amber" style={{ marginBottom: 12 }}>
              Simple & Predictable Flow
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.6rem)', marginBottom: 14 }}>
              How <span className="gradient-text">NeuroLite Works</span>
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(241,245,249,0.7)' }}>
              A predictable 8-step journey engineered to minimize anxiety, encourage natural curiosity, and ensure confident progression.
            </p>
          </div>

          {/* Workflow Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 20,
              position: 'relative',
            }}
            className="workflow-grid"
          >
            {workflowSteps.map((step, idx) => (
              <div
                key={step.num}
                className="glass-card"
                style={{
                  padding: '24px 20px',
                  borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 14,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 900,
                        color: 'var(--indigo-lt)',
                        background: 'rgba(99,102,241,0.2)',
                        padding: '4px 10px',
                        borderRadius: 8,
                      }}
                    >
                      Step {step.num}
                    </span>
                    <span style={{ fontSize: '1.8rem' }}>{step.icon}</span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', marginBottom: 4, color: '#f8fafc' }}>
                    {step.title}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(241,245,249,0.45)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase' }}>
                    {step.role}
                  </div>
                  <p style={{ fontSize: '0.84rem', lineHeight: 1.6, color: 'rgba(241,245,249,0.7)', margin: 0 }}>
                    {step.desc}
                  </p>
                </div>

                {idx < workflowSteps.length - 1 && (
                  <div
                    className="workflow-arrow"
                    style={{
                      marginTop: 14,
                      fontSize: '0.9rem',
                      color: 'var(--indigo-lt)',
                      fontWeight: 700,
                    }}
                  >
                    Next ➔
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: VOICE LEARNING SECTION ── */}
      <section
        id="voice-learning"
        ref={addRef('voice-learning')}
        style={{
          padding: '80px 20px',
          background: 'linear-gradient(180deg, rgba(20,20,45,0.4) 0%, rgba(13,13,26,0.6) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <span className="badge badge-purple" style={{ marginBottom: 12 }}>
              Hands-Free Speech Interaction
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.6rem)', marginBottom: 14 }}>
              Two-Way <span className="gradient-text">Voice Learning</span> Experience
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(241,245,249,0.7)' }}>
              Empowering students who find typing or reading difficult. NeuroLite listens patiently and speaks gently using offline Web Speech capabilities.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 36,
              alignItems: 'center',
            }}
            className="voice-grid"
          >
            {/* Left Column: Two-way diagram */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Flow 1: Text to Speech */}
              <div
                className="glass-card"
                style={{
                  padding: '24px 26px',
                  borderRadius: 20,
                  border: '1.5px solid rgba(99,102,241,0.3)',
                  background: 'rgba(99,102,241,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(99,102,241,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                    }}
                  >
                    🔊
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', margin: 0, color: '#f8fafc' }}>
                      Flow 1: Text ➔ Speech (TTS)
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--indigo-lt)' }}>
                      NeuroLite reads aloud ➔ Student listens
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'rgba(241,245,249,0.75)', lineHeight: 1.6, margin: 0 }}>
                  Questions, lesson stories, and error guidance are spoken aloud at an adjustable 0.85x calm speaking rate so dyslexic and auditory learners never get left behind.
                </p>
              </div>

              {/* Flow 2: Speech to Text */}
              <div
                className="glass-card"
                style={{
                  padding: '24px 26px',
                  borderRadius: 20,
                  border: '1.5px solid rgba(16,185,129,0.3)',
                  background: 'rgba(16,185,129,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(16,185,129,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                    }}
                  >
                    🎤
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', margin: 0, color: '#f8fafc' }}>
                      Flow 2: Speech ➔ Text (STT)
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#34d399' }}>
                      Student speaks ➔ System understands
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'rgba(241,245,249,0.75)', lineHeight: 1.6, margin: 0 }}>
                  Children answer quiz questions, navigate lessons, or practice creative writing by simply speaking. Built-in voice commands recognize commands like "Start lesson" and "Help me".
                </p>
              </div>
            </div>

            {/* Right Column: Live Interactive Voice Playground */}
            <div
              className="glass-card"
              style={{
                padding: '32px 28px',
                borderRadius: 24,
                border: '1.5px solid rgba(255,255,255,0.12)',
                background: 'rgba(20,20,40,0.8)',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                <button
                  onClick={() => setActiveVoiceTab('tts')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    border: '1px solid',
                    borderColor: activeVoiceTab === 'tts' ? 'var(--indigo)' : 'rgba(255,255,255,0.1)',
                    background: activeVoiceTab === 'tts' ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                    color: activeVoiceTab === 'tts' ? '#fff' : 'rgba(241,245,249,0.7)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  🔊 Listen (Text-to-Speech)
                </button>
                <button
                  onClick={() => setActiveVoiceTab('stt')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    border: '1px solid',
                    borderColor: activeVoiceTab === 'stt' ? '#10b981' : 'rgba(255,255,255,0.1)',
                    background: activeVoiceTab === 'stt' ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.04)',
                    color: activeVoiceTab === 'stt' ? '#fff' : 'rgba(241,245,249,0.7)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  🎤 Speak (Speech-to-Text)
                </button>
              </div>

              {activeVoiceTab === 'tts' ? (
                <>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: 14, color: '#f8fafc' }}>
                    Hear NeuroLite Speak
                  </h3>

                  {/* Sample text bubble */}
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      padding: '16px 20px',
                      marginBottom: 24,
                      fontSize: '0.94rem',
                      lineHeight: 1.6,
                      color: '#e2e8f0',
                      fontStyle: 'italic',
                    }}
                  >
                    "{demoText}"
                  </div>

                  {/* Animated Audio Button & Waveform Visualizer */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 16,
                      marginBottom: 20,
                    }}
                  >
                    <button
                      onClick={() => handlePlayVoiceDemo(demoText)}
                      className={`btn-icon ${isPlayingAudio ? 'animate-pulse-ring' : ''}`}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: isPlayingAudio
                          ? 'linear-gradient(135deg, #ef4444, #f59e0b)'
                          : 'linear-gradient(135deg, #6366f1, #a855f7)',
                        border: 'none',
                        fontSize: 32,
                        color: '#ffffff',
                        cursor: 'pointer',
                        boxShadow: isPlayingAudio
                          ? '0 0 30px rgba(239,68,68,0.6)'
                          : '0 0 25px rgba(99,102,241,0.5)',
                        transition: 'all 0.3s ease',
                      }}
                      title={isPlayingAudio ? 'Stop audio' : 'Listen now'}
                      aria-label="Play or stop sample voice"
                    >
                      {isPlayingAudio ? '⏹' : '🔊'}
                    </button>

                    {/* Animated Waveform */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 40 }}>
                      {[12, 28, 16, 36, 24, 40, 18, 32, 14, 26, 38, 20, 10].map((h, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: 4,
                            height: isPlayingAudio ? `${h}px` : '6px',
                            borderRadius: 3,
                            background: isPlayingAudio
                              ? 'linear-gradient(to top, #6366f1, #34d399)'
                              : 'rgba(255,255,255,0.2)',
                            transition: 'height 0.2s ease',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(241,245,249,0.55)' }}>
                    Text ➔ Speech: Reads calmly at 0.85x speed with natural pauses
                  </div>
                </>
              ) : (
                <>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: 14, color: '#f8fafc' }}>
                    Speak to NeuroLite
                  </h3>

                  {/* Recognition transcript bubble */}
                  <div
                    style={{
                      background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.25)',
                      borderRadius: 16,
                      padding: '16px 20px',
                      marginBottom: 24,
                      fontSize: '0.94rem',
                      lineHeight: 1.6,
                      color: sttResult ? '#34d399' : 'rgba(241,245,249,0.6)',
                      minHeight: 58,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {sttResult || 'Click the microphone below and say: "I love science!"'}
                  </div>

                  {/* Animated Microphone button */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 16,
                      marginBottom: 20,
                    }}
                  >
                    <button
                      onClick={handleStartMicDemo}
                      className={`btn-icon ${isListeningSTT ? 'animate-pulse-ring' : ''}`}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: isListeningSTT
                          ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                          : 'linear-gradient(135deg, #059669, #10b981)',
                        border: 'none',
                        fontSize: 32,
                        color: '#ffffff',
                        cursor: 'pointer',
                        boxShadow: isListeningSTT
                          ? '0 0 30px rgba(16,185,129,0.6)'
                          : '0 0 25px rgba(16,185,129,0.4)',
                        transition: 'all 0.3s ease',
                      }}
                      title={isListeningSTT ? 'Listening... click to stop' : 'Click to speak'}
                      aria-label="Toggle microphone for speech-to-text"
                    >
                      {isListeningSTT ? '🎙️' : '🎤'}
                    </button>

                    {/* Animated Waveform */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 40 }}>
                      {[14, 32, 20, 38, 26, 42, 22, 34, 18, 28, 36, 24, 12].map((h, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: 4,
                            height: isListeningSTT ? `${h}px` : '6px',
                            borderRadius: 3,
                            background: isListeningSTT
                              ? 'linear-gradient(to top, #10b981, #06b6d4)'
                              : 'rgba(255,255,255,0.2)',
                            transition: 'height 0.2s ease',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(241,245,249,0.55)' }}>
                    Speech ➔ Text: Student speaks, system understands without typing
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: EDUCATIONAL GAMES SECTION ── */}
      <section
        id="games"
        style={{
          padding: '80px 20px',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <span className="badge badge-green" style={{ marginBottom: 12 }}>
              Playful Mastery
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.6rem)', marginBottom: 14 }}>
              Integrated <span className="gradient-text">Educational Games</span>
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(241,245,249,0.7)' }}>
              Children learn best when they are active participants. Here are the actual working mini-games ready to play inside NeuroLite right now.
            </p>
          </div>

          {/* Currently Implemented Games */}
          <div className="grid-2" style={{ gap: 24, marginBottom: 36 }}>
            {/* Game 1: Math Speed Run */}
            <div
              className="glass-card"
              style={{
                padding: '32px 28px',
                borderRadius: 22,
                border: '1.5px solid rgba(99,102,241,0.3)',
                background: 'radial-gradient(ellipse at top left, rgba(99,102,241,0.15) 0%, rgba(255,255,255,0.02) 70%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: 44 }}>⚡</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-green">Ready to Play</span>
                    <span className="badge badge-amber">+10 XP / Answer</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.35rem', marginBottom: 8, color: '#f8fafc' }}>
                  Math Speed Run
                </h3>
                <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: 'rgba(241,245,249,0.75)', marginBottom: 20 }}>
                  A joyful 30-second arithmetic challenge featuring addition, subtraction, and multiplication (+, -, ×). Generates dynamic numbers with immediate visual feedback and points saving.
                </p>

                <div
                  style={{
                    background: 'rgba(0,0,0,0.25)',
                    borderRadius: 14,
                    padding: '12px 16px',
                    marginBottom: 20,
                    fontSize: '0.84rem',
                    color: 'rgba(241,245,249,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <span>⏱️ 30s Countdown</span>
                  <span>•</span>
                  <span>🏆 High Score Tracking</span>
                  <span>•</span>
                  <span>⭐ Level XP Reward</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (currentProfile) navigate('/games')
                  else navigate('/login')
                }}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                  width: '100%',
                  padding: '12px',
                  fontWeight: 700,
                }}
              >
                🎮 Play Math Speed Run →
              </button>
            </div>

            {/* Game 2: Word Match */}
            <div
              className="glass-card"
              style={{
                padding: '32px 28px',
                borderRadius: 22,
                border: '1.5px solid rgba(16,185,129,0.3)',
                background: 'radial-gradient(ellipse at top left, rgba(16,185,129,0.15) 0%, rgba(255,255,255,0.02) 70%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: 44 }}>🃏</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-green">Ready to Play</span>
                    <span className="badge badge-indigo">Memory & Vocabulary</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.35rem', marginBottom: 8, color: '#f8fafc' }}>
                  Word Match
                </h3>
                <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: 'rgba(241,245,249,0.75)', marginBottom: 20 }}>
                  A visual memory-matching card game. Flip cards to link vocabulary words (like CAT, SUN, BOOK, STAR) to their vivid emoji counterparts. Teaches visual-phonetic association.
                </p>

                <div
                  style={{
                    background: 'rgba(0,0,0,0.25)',
                    borderRadius: 14,
                    padding: '12px 16px',
                    marginBottom: 20,
                    fontSize: '0.84rem',
                    color: 'rgba(241,245,249,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <span>🧠 Working Memory</span>
                  <span>•</span>
                  <span>🐱 Visual Phonics</span>
                  <span>•</span>
                  <span>🎖️ Move Score Bonus</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (currentProfile) navigate('/games')
                  else navigate('/login')
                }}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  width: '100%',
                  padding: '12px',
                  fontWeight: 700,
                }}
              >
                🎮 Play Word Match →
              </button>
            </div>
          </div>

          {/* Planned Features / Coming Soon */}
          <div
            className="glass-card"
            style={{
              padding: '24px 28px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 26 }}>🚀</span>
              <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
                Upcoming Mini-Games (Planned Features)
              </h4>
            </div>

            <div className="grid-3" style={{ gap: 16 }}>
              {[
                { name: 'Story Adventure', icon: '📖', desc: 'Interactive choose-your-path narrative with visual social stories and calm choices.' },
                { name: 'Spelling Bee Quest', icon: '🐝', desc: 'Audio-guided phonics builder with gentle letter hints and no typing penalties.' },
                { name: 'Science Lab Quest', icon: '🔬', desc: 'Drag-and-drop experimental discovery cards exploring gravity, plants, and water.' },
              ].map((pg) => (
                <div
                  key={pg.name}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px dashed rgba(255,255,255,0.12)',
                    borderRadius: 14,
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#f8fafc' }}>
                      <span>{pg.icon}</span>
                      <span>{pg.name}</span>
                    </div>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(241,245,249,0.5)', fontSize: '0.65rem' }}>
                      Coming Soon
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(241,245,249,0.6)', lineHeight: 1.5 }}>
                    {pg.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: OFFLINE LEARNING SECTION ── */}
      <section
        id="offline"
        style={{
          padding: '80px 20px',
          background: 'linear-gradient(180deg, rgba(13,13,26,0.85) 0%, rgba(20,20,40,0.8) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 48,
              alignItems: 'center',
            }}
            className="offline-grid"
          >
            <div>
              <span className="badge badge-indigo" style={{ marginBottom: 14 }}>
                Privacy & Reliability
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.6rem)', marginBottom: 18 }}>
                100% Offline-First. <br />
                <span className="gradient-text">Zero Internet Required.</span>
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'rgba(241,245,249,0.78)', marginBottom: 24 }}>
                Schools, rural areas, and homes frequently face intermittent Wi-Fi or bandwidth restrictions. Furthermore, parents rightfully demand complete digital safety and zero ad surveillance for their children.
              </p>
              <p style={{ fontSize: '0.94rem', lineHeight: 1.7, color: 'rgba(241,245,249,0.68)', marginBottom: 28 }}>
                NeuroLite stores lessons, quizzes, voice recognition hooks, profiles, and streaks directly on the device using <strong>IndexedDB</strong> and <strong>localStorage</strong>.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { title: 'Local Curriculum Packages', desc: 'Pre-bundled lessons in Math, English, Science, and Social Studies.' },
                  { title: 'Local Ollama LLM Compatible', desc: 'Optional on-device AI tutor running Gemma 2B, Phi-3, or TinyLlama without external API fees.' },
                  { title: 'Native Web Speech APIs', desc: 'High quality system voices operate directly without sending audio files to remote servers.' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: 'rgba(99,102,241,0.2)',
                        color: 'var(--indigo-lt)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc' }}>{item.title}</div>
                      <div style={{ fontSize: '0.84rem', color: 'rgba(241,245,249,0.6)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Offline Architecture Graphic */}
            <div
              className="glass-card"
              style={{
                padding: '32px 28px',
                borderRadius: 24,
                border: '1.5px solid rgba(99,102,241,0.25)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 32 }}>📴</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>Local-First Privacy Architecture</h3>
                  <div style={{ fontSize: '0.78rem', color: '#34d399' }}>● Fully operational in Airplane Mode</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { layer: 'Browser / Device Runtime', tech: 'Client React + Vite PWA', icon: '💻' },
                  { layer: 'Storage Engine', tech: 'IndexedDB & LocalStorage', icon: '💾' },
                  { layer: 'Speech Processing', tech: 'Native Offline Web Speech API', icon: '🎙️' },
                  { layer: 'Adaptive Algorithm', tech: 'Local JavaScript State Machine', icon: '⚡' },
                  { layer: 'Optional AI Tutor', tech: 'Localhost Ollama (Gemma 2B / Phi-3)', icon: '🤖' },
                ].map((l, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 12,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{l.icon}</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>{l.layer}</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--indigo-lt)', fontFamily: 'monospace' }}>
                      {l.tech}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 9: SDG 4 – QUALITY EDUCATION ── */}
      <section
        id="sdg4"
        style={{
          padding: '80px 20px',
          background: 'linear-gradient(135deg, rgba(197, 25, 45, 0.12) 0%, rgba(13,13,26,0.95) 70%)',
          borderTop: '1px solid rgba(197, 25, 45, 0.25)',
          borderBottom: '1px solid rgba(197, 25, 45, 0.25)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '0.9fr 1.1fr',
              gap: 48,
              alignItems: 'center',
            }}
            className="sdg-grid"
          >
            {/* SDG 4 Badge / Emblem */}
            <div
              className="glass-card"
              style={{
                padding: '36px 30px',
                borderRadius: 24,
                border: '2px solid rgba(197, 25, 45, 0.4)',
                background: 'radial-gradient(ellipse at top left, rgba(197, 25, 45, 0.2) 0%, rgba(20,20,40,0.8) 100%)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 22,
                  background: '#c5192d',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 42,
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 30px rgba(197, 25, 45, 0.5)',
                  fontWeight: 900,
                }}
              >
                4
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: 8, color: '#f8fafc' }}>
                SDG 4: Quality Education
              </h3>
              <div style={{ fontSize: '0.86rem', color: '#fca5a5', fontWeight: 700, marginBottom: 16 }}>
                UNITED NATIONS SUSTAINABLE DEVELOPMENT GOAL
              </div>
              <p style={{ fontSize: '0.9rem', color: 'rgba(241,245,249,0.8)', lineHeight: 1.6, margin: 0 }}>
                "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all."
              </p>
            </div>

            {/* SDG 4 Alignment Details */}
            <div>
              <span
                className="badge"
                style={{
                  background: 'rgba(197, 25, 45, 0.25)',
                  color: '#fca5a5',
                  border: '1px solid rgba(197, 25, 45, 0.4)',
                  marginBottom: 14,
                }}
              >
                Global Impact & Educational Equity
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.5rem)', marginBottom: 16 }}>
                Bridging Accessibility Gaps for Every Child
              </h2>
              <p style={{ fontSize: '0.98rem', lineHeight: 1.7, color: 'rgba(241,245,249,0.8)', marginBottom: 20 }}>
                Over 15% of children globally experience learning differences. When software is locked behind expensive subscription paywalls, continuous cloud dependencies, or high cognitive friction, millions are systematically left behind.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 18px' }}>
                  <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.92rem', marginBottom: 4 }}>
                    🎯 SDG Target 4.5: Eliminate Learning Disparities
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'rgba(241,245,249,0.7)', lineHeight: 1.5 }}>
                    NeuroLite guarantees equal access to personalized educational tutoring for vulnerable, marginalized, and neurodiverse children without economic barriers.
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 18px' }}>
                  <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.92rem', marginBottom: 4 }}>
                    🏫 SDG Target 4.a: Disability-Sensitive Learning Environments
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'rgba(241,245,249,0.7)', lineHeight: 1.5 }}>
                    Provides specialized digital accommodations (speech-to-text, dyslexia typography, calm pacing) that transform any basic computer or tablet into an inclusive sanctuary.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 10: ACCESSIBILITY TOOLBOX ── */}
      <section
        id="accessibility"
        style={{
          padding: '80px 20px',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <span className="badge badge-indigo" style={{ marginBottom: 12 }}>
              Inclusive Accessibility
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.6rem)', marginBottom: 14 }}>
              Try NeuroLite’s <span className="gradient-text">Accessibility Controls</span>
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(241,245,249,0.7)' }}>
              Test how NeuroLite adapts instantaneously to individual sensory and reading needs right on this page.
            </p>
          </div>

          <div className="grid-4" style={{ gap: 20, marginBottom: 40 }}>
            {/* Control 1: Dyslexic Font */}
            <div
              className="glass-card"
              style={{
                padding: '28px 24px',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.1)',
                background: settings.dyslexicFont ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📖</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#f8fafc' }}>
                  Dyslexia-Friendly Font
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'rgba(241,245,249,0.7)', lineHeight: 1.6, marginBottom: 20 }}>
                  Increases letter-spacing and optimizes character weights to prevent character flipping and reduce reading fatigue.
                </p>
              </div>
              <button
                onClick={() => updateSettings({ dyslexicFont: !settings.dyslexicFont })}
                className="btn btn-secondary"
                style={{ width: '100%', fontWeight: 700 }}
              >
                {settings.dyslexicFont ? '✓ Dyslexic Font Active' : 'Toggle Dyslexic Font'}
              </button>
            </div>

            {/* Control 2: High Contrast */}
            <div
              className="glass-card"
              style={{
                padding: '28px 24px',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.1)',
                background: settings.highContrast ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>◐</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#f8fafc' }}>
                  High Contrast Mode
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'rgba(241,245,249,0.7)', lineHeight: 1.6, marginBottom: 20 }}>
                  Sharpens element outlines, amplifies color separations, and boosts readability under various classroom lighting conditions.
                </p>
              </div>
              <button
                onClick={() => updateSettings({ highContrast: !settings.highContrast })}
                className="btn btn-secondary"
                style={{ width: '100%', fontWeight: 700 }}
              >
                {settings.highContrast ? '✓ High Contrast Active' : 'Toggle High Contrast'}
              </button>
            </div>

            {/* Control 3: Reduced Motion */}
            <div
              className="glass-card"
              style={{
                padding: '28px 24px',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.1)',
                background: settings.reducedMotion ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏹️</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#f8fafc' }}>
                  Reduced Motion Mode
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'rgba(241,245,249,0.7)', lineHeight: 1.6, marginBottom: 20 }}>
                  Eliminates vestibular motion triggers and slows background particle loops for sensory-sensitive learners.
                </p>
              </div>
              <button
                onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
                className="btn btn-secondary"
                style={{ width: '100%', fontWeight: 700 }}
              >
                {settings.reducedMotion ? '✓ Reduced Motion Active' : 'Toggle Reduced Motion'}
              </button>
            </div>

            {/* Control 4: Speech Pacing */}
            <div
              className="glass-card"
              style={{
                padding: '28px 24px',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎧</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#f8fafc' }}>
                  Calm Speech Rate
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'rgba(241,245,249,0.7)', lineHeight: 1.6, marginBottom: 20 }}>
                  Audio narration runs at a comfortable 0.85x speed with natural pauses, preventing auditory rush and cognitive overload.
                </p>
              </div>
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--indigo-lt)',
                  textAlign: 'center',
                }}
              >
                Default Speed: {settings.speechRate || 0.85}x
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 11: LEARNING DASHBOARD PREVIEW ── */}
      <section
        id="learning"
        style={{
          padding: '80px 20px',
          background: 'linear-gradient(180deg, rgba(17,17,40,0.8) 0%, rgba(13,13,26,0.95) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <span className="badge badge-amber" style={{ marginBottom: 12 }}>
              Student Experience
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.6rem)', marginBottom: 14 }}>
              The <span className="gradient-text">NeuroLite Dashboard</span>
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(241,245,249,0.7)' }}>
              Step directly into the working learning suite. Every button, subject quiz, game, and badge is preserved and immediately accessible.
            </p>
          </div>

          <div
            className="glass-card"
            style={{
              padding: '36px 32px',
              borderRadius: 24,
              border: '1.5px solid rgba(99,102,241,0.3)',
              background: 'radial-gradient(ellipse at top center, rgba(99,102,241,0.12) 0%, rgba(20,20,40,0.7) 100%)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '16px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>📚</div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc' }}>5 Subjects</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(241,245,249,0.5)' }}>Math, English, Science, Social, Memory</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '16px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>⚡</div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc' }}>Adaptive Quiz</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(241,245,249,0.5)' }}>Auto-calibrating difficulty</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '16px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>🤖</div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc' }}>AI Tutor Chat</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(241,245,249,0.5)' }}>Patient offline conversational buddy</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '16px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>👨‍👩‍👧</div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc' }}>Parent View</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(241,245,249,0.5)' }}>Accuracy & history breakdown</div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleStartLearning}
                className="btn btn-primary btn-lg glow-indigo"
                style={{
                  padding: '16px 40px',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                }}
              >
                🚀 Open NeuroLite Learning App Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 12.5: IMPACT STATS ── */}
      <section
        style={{
          padding: '60px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'linear-gradient(180deg, rgba(10,10,22,0.9) 0%, rgba(15,15,35,0.95) 100%)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            className="reveal"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 20,
            }}
          >
            {impactStats.map((s, i) => (
              <div
                key={s.label}
                className="stat-counter-card"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `${s.color}20`,
                    border: `1.5px solid ${s.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    margin: '0 auto 12px',
                  }}
                >
                  {s.icon}
                </div>
                <div
                  style={{
                    fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                    fontWeight: 900,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    color: s.color,
                    marginBottom: 6,
                  }}
                >
                  {s.num}<span style={{ fontSize: '0.6em', opacity: 0.8 }}>{s.suffix}</span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(241,245,249,0.65)', lineHeight: 1.3 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @media (max-width: 900px) {
            .impact-stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
          }
          @media (max-width: 550px) {
            .impact-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>
      </section>

      {/* ── SECTION 13: TESTIMONIALS ── */}
      <section
        style={{
          padding: '80px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient background glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '5%', width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="reveal" style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 52px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 18px', borderRadius: 999,
              background: 'rgba(168,85,247,0.15)',
              border: '1px solid rgba(168,85,247,0.3)',
              marginBottom: 16,
            }}>
              <span>💬</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Families & Educators Love NeuroLite
              </span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', marginBottom: 14 }}>
              Real Stories from Real <span className="gradient-text">Families</span>
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(241,245,249,0.65)' }}>
              Parents, teachers, and learning specialists share their experiences with NeuroLite's inclusive learning approach.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 22,
            }}
            className="testimonials-grid reveal-stagger"
          >
            {testimonials.map((t, i) => (
              <div key={t.name} className="testimonial-card reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                {/* Stars */}
                <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <span key={si} style={{ color: '#fbbf24', fontSize: '0.95rem' }}>★</span>
                  ))}
                </div>

                {/* Quote text */}
                <p style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  color: 'rgba(241,245,249,0.82)',
                  marginBottom: 20,
                  fontStyle: 'italic',
                }}>
                  {t.text}
                </p>

                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: `${t.color}25`,
                    border: `1.5px solid ${t.color}45`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(241,245,249,0.5)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust indicators bar */}
          <div className="reveal" style={{
            marginTop: 48,
            padding: '22px 32px',
            borderRadius: 18,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 32,
          }}>
            {[
              { icon: '🏆', text: 'SDG 4 Quality Education Aligned' },
              { icon: '🔒', text: 'Zero Data Collection, Ever' },
              { icon: '💯', text: '100% Free for All Families' },
              { icon: '♿', text: 'WCAG 2.1 AA Accessibility' },
              { icon: '📴', text: 'Fully Offline Capable' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.86rem', color: 'rgba(241,245,249,0.7)', fontWeight: 500 }}>
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @media (max-width: 900px) {
            .testimonials-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 580px) {
            .testimonials-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ── SECTION 14: FAQ & CONTACT ── */}
      <section
        id="contact"
        style={{
          padding: '80px 20px',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 0.9fr',
              gap: 48,
            }}
            className="faq-grid"
          >
            {/* FAQ Accordion */}
            <div>
              <span className="badge badge-purple" style={{ marginBottom: 12 }}>
                Common Questions
              </span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', marginBottom: 24 }}>
                Frequently Asked <span className="gradient-text">Questions</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="glass-card"
                    style={{
                      borderRadius: 16,
                      border: '1px solid rgba(255,255,255,0.08)',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        background: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: '0.96rem',
                      }}
                    >
                      <span>{faq.q}</span>
                      <span style={{ fontSize: '1.1rem', color: 'var(--indigo-lt)', marginLeft: 12 }}>
                        {faqOpen === idx ? '−' : '+'}
                      </span>
                    </button>
                    {faqOpen === idx && (
                      <div
                        style={{
                          padding: '0 20px 18px',
                          color: 'rgba(241,245,249,0.72)',
                          fontSize: '0.88rem',
                          lineHeight: 1.6,
                        }}
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact & Feedback Form */}
            <div>
              <span className="badge badge-indigo" style={{ marginBottom: 12 }}>
                Get In Touch
              </span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', marginBottom: 24 }}>
                Parent & Educator <span className="gradient-text">Feedback</span>
              </h2>

              <div
                className="glass-card"
                style={{
                  padding: '28px 26px',
                  borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                {contactSubmitted ? (
                  <div style={{ textAlign: 'center', padding: '24px 10px' }} className="animate-scaleIn">
                    <div style={{ fontSize: 48, marginBottom: 12 }}>💌</div>
                    <h3 className="gradient-text" style={{ marginBottom: 8 }}>Thank You!</h3>
                    <p style={{ color: 'rgba(241,245,249,0.8)', fontSize: '0.9rem' }}>
                      Your message has been received. Our team will review your suggestions to make NeuroLite even more accessible.
                    </p>
                    <button
                      onClick={() => setContactSubmitted(false)}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: 16 }}
                    >
                      Send Another Note
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      setContactSubmitted(true)
                      showNotification('Thank you for reaching out to NeuroLite! 🌟', 'success')
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(241,245,249,0.8)', marginBottom: 6 }}>
                        Your Name
                      </label>
                      <input
                        className="input"
                        type="text"
                        placeholder="Parent / Special Educator Name"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(241,245,249,0.8)', marginBottom: 6 }}>
                        Email Address
                      </label>
                      <input
                        className="input"
                        type="email"
                        placeholder="youremail@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(241,245,249,0.8)', marginBottom: 6 }}>
                        Message or Accessibility Suggestion
                      </label>
                      <textarea
                        className="input"
                        rows={4}
                        placeholder="Tell us about your student's needs, desired accommodations, or feedback..."
                        required
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '12px', fontWeight: 700 }}
                    >
                      Send Message 📨
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 13: FOOTER ── */}
      <footer
        role="contentinfo"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10,10,20,0.98)',
          padding: '60px 20px 30px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
              gap: 40,
              marginBottom: 48,
            }}
            className="footer-grid"
          >
            {/* Col 1: Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                  }}
                >
                  🧠
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#f8fafc' }}>
                    Neuro<span className="gradient-text">Lite</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(241,245,249,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Learning in Your Own Way
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.86rem', lineHeight: 1.6, color: 'rgba(241,245,249,0.6)', maxWidth: 320 }}>
                Offline AI-powered adaptive learning assistant for neurodiverse K-5 students, supporting autism, ADHD, dyslexia, and unique cognitive styles.
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc', marginBottom: 14 }}>
                Explore Site
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.86rem' }}>
                <li><a href="#hero" style={{ color: 'rgba(241,245,249,0.6)', textDecoration: 'none' }}>Home</a></li>
                <li><a href="#about" style={{ color: 'rgba(241,245,249,0.6)', textDecoration: 'none' }}>About NeuroLite</a></li>
                <li><a href="#features" style={{ color: 'rgba(241,245,249,0.6)', textDecoration: 'none' }}>Features</a></li>
                <li><a href="#how-it-works" style={{ color: 'rgba(241,245,249,0.6)', textDecoration: 'none' }}>How It Works</a></li>
                <li><a href="#games" style={{ color: 'rgba(241,245,249,0.6)', textDecoration: 'none' }}>Educational Games</a></li>
              </ul>
            </div>

            {/* Col 3: Inclusion & SDG */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc', marginBottom: 14 }}>
                Inclusion & Safety
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.86rem' }}>
                <li><a href="#accessibility" style={{ color: 'rgba(241,245,249,0.6)', textDecoration: 'none' }}>Accessibility Hub</a></li>
                <li><a href="#sdg4" style={{ color: 'rgba(241,245,249,0.6)', textDecoration: 'none' }}>UN SDG 4 Commitment</a></li>
                <li><a href="#offline" style={{ color: 'rgba(241,245,249,0.6)', textDecoration: 'none' }}>Offline Privacy Standard</a></li>
                <li><a href="#voice-learning" style={{ color: 'rgba(241,245,249,0.6)', textDecoration: 'none' }}>Voice Accommodations</a></li>
              </ul>
            </div>

            {/* Col 4: Launch App */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc', marginBottom: 14 }}>
                Student Portal
              </div>
              <p style={{ fontSize: '0.82rem', color: 'rgba(241,245,249,0.6)', marginBottom: 12 }}>
                Ready to continue your learning adventure?
              </p>
              <button
                onClick={handleStartLearning}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', fontWeight: 700 }}
              >
                Launch Learning App 🚀
              </button>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div
            style={{
              paddingTop: 24,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              fontSize: '0.8rem',
              color: 'rgba(241,245,249,0.45)',
            }}
          >
            <div>
              © {new Date().getFullYear()} NeuroLite. Designed with ❤️ for Neurodiverse K-5 Learners.
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span>Privacy First: 100% Local Storage</span>
              <span>•</span>
              <span>No Telemetry / No Ads</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .about-grid, .voice-grid, .offline-grid, .sdg-grid, .faq-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .workflow-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .workflow-grid {
            grid-template-columns: 1fr !important;
          }
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
