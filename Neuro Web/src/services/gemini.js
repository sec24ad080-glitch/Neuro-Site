import { getGeminiApiKey } from './storage.js'

const OFFLINE_RESPONSES = [
  { keywords: ['hello','hi','hey'], reply: "Hello! 👋 I'm NeuroLex, your AI learning buddy powered by Google Gemini! How can I help you today?" },
  { keywords: ['math','add','subtract','multiply','divide','number'], reply: "Math is fun! 🔢 Start with small steps. Try counting objects around you, or use your fingers for addition!" },
  { keywords: ['read','reading','word','letter','spell'], reply: "Reading is a superpower! 📚 Try reading slowly and pointing at each word. Pictures can help understand the story!" },
  { keywords: ['science','experiment','nature'], reply: "Science is all about curiosity! 🔬 Ask 'why' and 'how' about everything you see around you!" },
  { keywords: ['hard','difficult','cant','can\'t','help','stuck'], reply: "It's okay to find things hard! 💪 Everyone learns at their own pace. Try breaking the problem into smaller pieces." },
  { keywords: ['good','great','awesome','correct','yes'], reply: "You're doing amazing! 🌟 Keep going — every correct answer makes you smarter!" },
  { keywords: ['wrong','mistake','fail','no'], reply: "Mistakes help us learn! 🧠 Every mistake is a step toward getting it right. Try again!" },
  { keywords: ['bored','boring','fun'], reply: "Let's make it exciting! 🎮 Try the games section or challenge yourself with a harder quiz!" },
  { keywords: ['tired','break'], reply: "Take a short break! 🌈 Drink some water, stretch, and come back refreshed. You can do it!" },
  { keywords: ['explain','what is','how does'], reply: "Great question! 🤔 Let me think about that with you. Can you tell me more about what you already know?" },
]

function offlineFallback(message) {
  const lower = message.toLowerCase()
  for (const entry of OFFLINE_RESPONSES) {
    if (entry.keywords.some(k => lower.includes(k))) return entry.reply
  }
  return "That's a great question! 🤔 I'm currently offline, but keep exploring — curiosity is the best teacher! Ask your parent or teacher for help with this one."
}

const SYSTEM_PROMPT = `Role:
You are Lex, a friendly AI learning assistant designed for students. Your purpose is to answer what the user asks in a simple, clear, encouraging, and helpful way. Never make the student feel embarrassed or judged.

Instructions:
1. Always give accurate, clear answers to whatever question the user asks.
2. Use simple words and short sentences.
3. Explain complex ideas step-by-step with simple examples.
4. Give positive encouragement in every response.
5. Highlight important words using markdown bold format.
6. Use emojis to keep responses engaging and friendly.
7. Keep responses concise, well-structured, and easy to read.`

const GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro'
]

export async function testGeminiApiKey(apiKey) {
  const keyToUse = (apiKey || getGeminiApiKey() || '').trim()
  if (!keyToUse) return { ok: false, error: 'No Gemini API key provided.' }

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToUse}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Hello! Respond with: "Ready"' }] }]
          })
        }
      )
      const data = await response.json()
      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return { ok: true, model, reply: data.candidates[0].content.parts[0].text }
      }
      if (data.error) {
        return { ok: false, error: data.error.message }
      }
    } catch {
      // try next model
    }
  }
  return { ok: false, error: 'Failed to connect to Gemini API. Please check your internet connection and API key.' }
}

export async function sendGeminiMessage(messages, userMessage, apiKey) {
  const keyToUse = (apiKey || getGeminiApiKey() || '').trim()

  if (!keyToUse) {
    return "🔑 **Gemini API Key Needed**: Please enter your free Google Gemini API Key (starts with `AIzaSy...`) in **Settings ⚙️** or add `VITE_GEMINI_API_KEY=your_key` to `.env` to receive live answers from Google Gemini!"
  }

  if (!navigator.onLine) {
    await new Promise(r => setTimeout(r, 400))
    return offlineFallback(userMessage)
  }

  // Sanitize history into user / model roles
  const conversationHistory = (messages || []).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content || '' }]
  })).filter(m => m.parts[0].text.trim() !== '')

  let lastApiError = ''

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToUse}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [
              ...conversationHistory,
              { role: 'user', parts: [{ text: userMessage }] }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 600,
            }
          })
        }
      )

      const data = await response.json()

      if (data.error) {
        lastApiError = data.error.message
        console.warn(`Gemini model ${model} error:`, data.error.message)
        continue
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        return text
      }
    } catch (err) {
      console.warn(`Gemini request for model ${model} failed:`, err)
    }
  }

  if (lastApiError) {
    // If API key is invalid, provide a clear, helpful response explaining how to get a Google AI Studio key
    if (lastApiError.toLowerCase().includes('api key not valid') || lastApiError.toLowerCase().includes('invalid')) {
      const helpfulReply = offlineFallback(userMessage)
      return `🤖 **NeuroLex AI Answer:**\n\n${helpfulReply}\n\n---\n🔑 **Note on Gemini API Key:** The configured key returned: *"${lastApiError}"*.\nGoogle Gemini API keys start with \`AIzaSy...\`. You can get a free official key at [Google AI Studio](https://aistudio.google.com/app/apikey) and enter it in **Settings ⚙️** anytime!`
    }
    return `⚠️ **Gemini API Notice**: ${lastApiError}.\n\nGet a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey) and enter it in **Settings ⚙️**.`
  }

  return offlineFallback(userMessage)
}


// Speech recognition with enhanced accuracy using Web Speech API
export function startEnhancedListening(onResult, onInterim, onEnd, lang = 'en-US') {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) { onEnd?.(); return null }
  
  const recognition = new SpeechRecognition()
  recognition.lang = lang
  recognition.interimResults = true      // Stream partial results
  recognition.maxAlternatives = 3       // Get multiple alternatives for better accuracy
  recognition.continuous = false
  
  recognition.onresult = (e) => {
    let interim = ''
    let final = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const transcript = e.results[i][0].transcript
      if (e.results[i].isFinal) {
        final += transcript
      } else {
        interim += transcript
      }
    }
    if (interim) onInterim?.(interim)
    if (final) onResult(final)
  }
  
  recognition.onend = () => onEnd?.()
  recognition.onerror = (e) => {
    console.warn('Speech recognition error:', e.error)
    onEnd?.()
  }
  
  recognition.start()
  return recognition
}
