// LocalStorage service — clean wrappers for all persistent data

// ──────────────────────────────────────────────
// Profiles
// ──────────────────────────────────────────────
export const getProfiles = () => {
  try { return JSON.parse(localStorage.getItem('neurolex_profiles') || '[]') }
  catch { return [] }
}

export const saveProfile = (profiles) => {
  localStorage.setItem('neurolex_profiles', JSON.stringify(profiles))
}

// ──────────────────────────────────────────────
// Progress
// ──────────────────────────────────────────────
export const getProgress = (profileId) => {
  try { return JSON.parse(localStorage.getItem(`neurolex_progress_${profileId}`) || '{}') }
  catch { return {} }
}

export const saveProgress = (profileId, progress) => {
  localStorage.setItem(`neurolex_progress_${profileId}`, JSON.stringify(progress))
}

// ──────────────────────────────────────────────
// Session history (quiz/lesson results)
// ──────────────────────────────────────────────
export const getHistory = (profileId) => {
  try { return JSON.parse(localStorage.getItem(`neurolex_history_${profileId}`) || '[]') }
  catch { return [] }
}

export const addHistoryEntry = (profileId, entry) => {
  const history = getHistory(profileId)
  const updated = [{ ...entry, timestamp: new Date().toISOString() }, ...history].slice(0, 50)
  localStorage.setItem(`neurolex_history_${profileId}`, JSON.stringify(updated))
}

// ──────────────────────────────────────────────
// Chat history
// ──────────────────────────────────────────────
export const getChatHistory = (profileId) => {
  try { return JSON.parse(localStorage.getItem(`neurolex_chat_${profileId}`) || '[]') }
  catch { return [] }
}

export const saveChatHistory = (profileId, messages) => {
  // Keep last 100 messages
  localStorage.setItem(`neurolex_chat_${profileId}`, JSON.stringify(messages.slice(-100)))
}

export const clearChatHistory = (profileId) => {
  localStorage.removeItem(`neurolex_chat_${profileId}`)
}

// ──────────────────────────────────────────────
// Lessons progress
// ──────────────────────────────────────────────
export const getLessonProgress = (profileId) => {
  try {
    return JSON.parse(localStorage.getItem(`neurolex_lesson_progress_${profileId}`) || '{}')
  } catch { return {} }
}

export const saveLessonProgress = (profileId, lessonId, data) => {
  const all = getLessonProgress(profileId)
  all[lessonId] = { ...data, completedAt: new Date().toISOString() }
  localStorage.setItem(`neurolex_lesson_progress_${profileId}`, JSON.stringify(all))
}

export const getCurrentLesson = (profileId) => {
  return localStorage.getItem(`neurolex_current_lesson_${profileId}`) || null
}

export const setCurrentLesson = (profileId, lessonId) => {
  if (lessonId) {
    localStorage.setItem(`neurolex_current_lesson_${profileId}`, lessonId)
  } else {
    localStorage.removeItem(`neurolex_current_lesson_${profileId}`)
  }
}

// ──────────────────────────────────────────────
// Quiz data (local)
// ──────────────────────────────────────────────
export const getQuizResults = (profileId) => {
  try {
    return JSON.parse(localStorage.getItem(`neurolex_quiz_results_${profileId}`) || '[]')
  } catch { return [] }
}

export const saveQuizResult = (profileId, result) => {
  const all = getQuizResults(profileId)
  const updated = [{ ...result, timestamp: new Date().toISOString() }, ...all].slice(0, 50)
  localStorage.setItem(`neurolex_quiz_results_${profileId}`, JSON.stringify(updated))
}

// ──────────────────────────────────────────────
// Voice & AI preferences
// ──────────────────────────────────────────────
export const getVoicePrefs = () => {
  try {
    return JSON.parse(localStorage.getItem('neurolex_voice_prefs') || '{}')
  } catch { return {} }
}

export const saveVoicePrefs = (prefs) => {
  const current = getVoicePrefs()
  localStorage.setItem('neurolex_voice_prefs', JSON.stringify({ ...current, ...prefs }))
}

export const getOllamaModel = () => {
  return localStorage.getItem('neurolex_ollama_model') || 'gemma2:2b'
}

export const setOllamaModel = (model) => {
  localStorage.setItem('neurolex_ollama_model', model)
}

export const getAIMode = () => {
  // 'auto' = try ollama, fallback to gemini if key available, fallback to keywords
  // 'ollama' = force ollama only
  // 'gemini' = force gemini only
  return localStorage.getItem('neurolex_ai_mode') || 'auto'
}

export const setAIMode = (mode) => {
  localStorage.setItem('neurolex_ai_mode', mode)
}

export const getGeminiApiKey = () => {
  return localStorage.getItem('neurolex_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || ''
}

export const setGeminiApiKey = (key) => {
  if (key) {
    localStorage.setItem('neurolex_gemini_api_key', key.trim())
  } else {
    localStorage.removeItem('neurolex_gemini_api_key')
  }
}

