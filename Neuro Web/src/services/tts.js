// Text-to-Speech and Speech-to-Text helpers using Web Speech API
// All offline — no cloud calls.

// ──────────────────────────────────────────────
// TTS
// ──────────────────────────────────────────────

let currentUtterance = null

export function isTTSAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(text, rate = 0.85, lang = 'en-US') {
  if (!isTTSAvailable()) return
  window.speechSynthesis.cancel()
  currentUtterance = null

  const cleanText = text
    .replace(/[🎉🌟⭐🔢📚🔬💪🧠🎮🌈🤔👋💬🎨🏷️⚡🍕🌿💧🪐☀️❤️🫁🦷👁️👂🦴💪🌱🐾👤🌳🪨🪑💧🚗📚✅❌]/gu, '')
    .replace(/\*\*/g, '')
    .replace(/#{1,6}\s/g, '')
    .trim()

  const utter = new SpeechSynthesisUtterance(cleanText)
  utter.rate  = rate
  utter.pitch = 1.05
  utter.lang  = lang

  // Pick the best available offline voice
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v =>
    v.lang.startsWith(lang.slice(0, 2)) && !v.name.toLowerCase().includes('online')
  ) || voices.find(v => v.lang.startsWith(lang.slice(0, 2)))
  if (preferred) utter.voice = preferred

  currentUtterance = utter
  window.speechSynthesis.speak(utter)
  return utter
}

export function stopSpeaking() {
  if (isTTSAvailable()) {
    window.speechSynthesis.cancel()
    currentUtterance = null
  }
}

export function isSpeaking() {
  return isTTSAvailable() && window.speechSynthesis.speaking
}

// Speak with a callback when done
export function speakWithCallback(text, rate = 0.85, lang = 'en-US', onEnd) {
  if (!isTTSAvailable()) { onEnd?.(); return }
  const utter = speak(text, rate, lang)
  if (utter && onEnd) utter.onend = onEnd
}

// ──────────────────────────────────────────────
// STT — Speech Recognition (Web Speech API)
// ──────────────────────────────────────────────

export function isSTTAvailable() {
  return typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function startListening(onResult, onInterim, onEnd, lang = 'en-US') {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) { onEnd?.(); return null }

  const recognition = new SpeechRecognition()
  recognition.lang  = lang
  recognition.interimResults = true
  recognition.maxAlternatives = 3
  recognition.continuous = false

  recognition.onresult = (e) => {
    let interim = ''
    let final   = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const transcript = e.results[i][0].transcript
      if (e.results[i].isFinal) final   += transcript
      else                       interim += transcript
    }
    if (interim && typeof onInterim === 'function') onInterim(interim)
    if (final   && typeof onResult  === 'function') onResult(final)
  }

  recognition.onend   = () => typeof onEnd === 'function' && onEnd()
  recognition.onerror = () => typeof onEnd === 'function' && onEnd()
  recognition.start()
  return recognition
}

// Legacy alias kept for backward compatibility
export function startEnhancedListening(onResult, onInterim, onEnd, lang = 'en-US') {
  return startListening(onResult, onInterim, onEnd, lang)
}

// ──────────────────────────────────────────────
// Language helpers
// ──────────────────────────────────────────────

export function getLangCode(appLang) {
  const map = { en: 'en-US', ta: 'ta-IN', hi: 'hi-IN' }
  return map[appLang] || 'en-US'
}
