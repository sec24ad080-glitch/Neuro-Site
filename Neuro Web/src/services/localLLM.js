/**
 * NeuroLite Local LLM Service
 * Calls Ollama REST API at http://localhost:11434 (loopback — no internet needed).
 * If Ollama is not running, returns keyword-based responses.
 * NEVER calls OpenAI, Gemini, or any cloud API.
 */

export const OLLAMA_BASE = 'http://localhost:11434'
export const DEFAULT_MODEL = 'gemma2:2b'

// ──────────────────────────────────────────────
// NeuroLite system prompt (neurodiverse-friendly)
// ──────────────────────────────────────────────
const SYSTEM_PROMPT = `You are NeuroLex, a friendly and patient AI learning assistant for NeuroLite, an educational app designed for children with autism, ADHD, and dyslexia.

Your personality:
- Warm, encouraging, and positive at all times
- Never shame a student for wrong answers — say "Good try!" or "Let's figure it out together!"
- Patient and calm

Your communication style:
- Use simple, short sentences (max 2-3 sentences per response)
- Use emojis to make responses fun and friendly
- Explain one idea at a time
- Use real-life examples children can relate to
- Avoid jargon or complex vocabulary
- Never use long paragraphs

When a student says "make it easier": simplify your explanation even further, use smaller words and more examples.
When a student says "make it harder": add a little more detail and challenge, but stay age-appropriate.
When a student is confused: restate the concept in a completely different way.
When a student gets something right: celebrate enthusiastically!

Always end responses with a small encouragement or question to keep the student engaged.`

import { getAllLessons } from '../data/lessons/index.js'

// ──────────────────────────────────────────────
// Keyword fallback responses (when Ollama is offline)
// ──────────────────────────────────────────────
const OFFLINE_RESPONSES = [
  {
    keywords: ['hello','hi','hey','hiya','greetings'],
    reply: "Hello! 👋 I'm NeuroLex, your learning buddy! What subject would you like to explore today? Math 🔢, English 📖, Science 🔬, Social Studies 🗺️, or Memory 🧠?"
  },
  {
    keywords: ['subject', 'subjects', 'topic', 'topics', 'what can i learn', 'list subjects'],
    reply: "Here are all the subjects you can learn in offline mode! 📚\n\n🔢 **Mathematics**: Counting, Addition, Subtraction, Shapes, Multiplication, Fractions\n📖 **English**: Alphabet, Reading Phonics, Nouns, Verbs, Sentences, Adjectives\n🔬 **Science**: Living & Non-Living Things, Human Body, Photosynthesis, Water Cycle, Solar System\n🗺️ **Social Studies**: History, Maps, Countries, & Community\n🧠 **Memory & Focus**: Recall Games & Attention Exercises\n\nAsk me about any subject or topic!"
  },
  {
    keywords: ['math', 'maths', 'mathematics'],
    reply: "Math is like a fun puzzle! 🔢 You can learn about:\n• Counting to 10 🍎\n• Addition (Adding Up) ➕\n• Subtraction (Taking Away) ➖\n• Shapes Around Us 🔷\n• Multiplication ✖️\n• Fractions 🍕\n\nAsk me about any of these topics!"
  },
  {
    keywords: ['english', 'grammar', 'reading', 'spelling', 'alphabet'],
    reply: "English is a superpower! 📖 You can learn about:\n• The Alphabet (26 letters & vowels) 🔤\n• Reading Simple Words (Phonics) 📚\n• Nouns (Naming Words) 🏷️\n• Verbs (Action Words) ⚡\n• Sentences (Building thoughts) 💬\n• Adjectives (Describing Words) 🎨\n\nWhat would you like to read about?"
  },
  {
    keywords: ['science', 'nature', 'experiment'],
    reply: "Science is all about asking WHY! 🔬 You can learn about:\n• Living & Non-Living Things 🌿\n• The Human Body & Organs 🧠\n• Photosynthesis (How plants eat sunlight) ☀️\n• The Water Cycle 💧\n• The Solar System & 8 Planets 🪐\n\nWhich science topic interests you?"
  },
  {
    keywords: ['social studies', 'social', 'history', 'map', 'maps', 'geography', 'country', 'community'],
    reply: "Social Studies connects us to the world! 🗺️ Learn about maps, ancient history, communities, and different countries around the world. History is like a big adventure story!"
  },
  {
    keywords: ['memory', 'focus', 'brain', 'attention', 'recall'],
    reply: "Train your brain! 🧠 Practice recall games, visual memory exercises, and step-by-step focus techniques to make learning easier and faster."
  },
  {
    keywords: ['fraction','half','quarter','numerator','denominator'],
    reply: "Fractions are like sharing! 🍕 If you cut a pizza into 4 equal slices and eat 1 slice, you ate 1/4 (one quarter). The bottom number is total slices, top number is what you ate!"
  },
  {
    keywords: ['shape','shapes','circle','square','triangle','rectangle'],
    reply: "Shapes are everywhere! 🔷\n• Circle ⭕: Round with no corners!\n• Square 🟥: 4 equal sides & 4 corners.\n• Triangle 🔷: 3 sides & 3 corners.\n• Rectangle ⬛: 2 long sides & 2 short sides."
  },
  {
    keywords: ['hard','difficult','cant','can\'t','help','stuck','confused'],
    reply: "It's totally okay to find things hard! 💪 Everyone does. Let's slow down and take it one tiny step at a time. Tell me what part feels tricky!"
  },
  {
    keywords: ['good','great','awesome','correct','right','yes','i did it','did it'],
    reply: "YES! Amazing job! 🌟⭐ You're getting smarter every second! Keep going — you're on a roll!"
  },
  {
    keywords: ['wrong','mistake','fail','no','incorrect'],
    reply: "Mistakes are how we learn! 🧠 Every mistake means your brain is growing stronger. Let's try again together!"
  },
  {
    keywords: ['bored','boring','fun','game'],
    reply: "Let's make it exciting! 🎮 Try the Games page or take a subject quiz to challenge yourself!"
  },
  {
    keywords: ['tired','break','rest','stop'],
    reply: "Take a short break — you deserve it! 🌈 Drink some water, do a little stretch, then come back. Your brain will thank you!"
  },
  {
    keywords: ['photosynthesis','plant food','chlorophyll'],
    reply: "Photosynthesis is how plants make food! 🌿 Plants take Sunlight ☀️ + Water 💧 + Air (CO₂) 💨 to make Sugar for energy and release Oxygen 🌬️ for us to breathe!"
  },
  {
    keywords: ['solar system','planet','planets','mars','jupiter','saturn','earth','sun'],
    reply: "The Solar System has 8 planets orbiting the Sun! 🪐 Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Remember: 'My Very Educated Mother Just Served Us Noodles'!"
  },
  {
    keywords: ['water cycle','evaporation','condensation','precipitation'],
    reply: "The Water Cycle never stops! 💧\n1. Evaporation ☀️: Sun heats water into vapour\n2. Condensation ☁️: Vapour forms clouds\n3. Precipitation 🌧️: Rain or snow falls\n4. Collection 🌊: Water fills rivers & oceans!"
  },
  {
    keywords: ['human body','heart','brain','lungs','bones','muscles'],
    reply: "Your body is amazing! 🧠 Brain controls everything, ❤️ Heart pumps blood (~100,000 beats/day!), 🫁 Lungs breathe oxygen, and 🦴 206 Bones make your skeleton!"
  },
  {
    keywords: ['addition','adding','sum','plus'],
    reply: "Addition means putting things together! ➕ Try this: hold up 3 fingers on one hand, and 2 fingers on the other hand. Count them all: 1, 2, 3, 4, 5! 3 + 2 = 5!"
  },
  {
    keywords: ['subtraction','take away','minus','difference'],
    reply: "Subtraction means taking things away! ➖ If you have 5 apples 🍎 and eat 2 😋, put down 2 fingers. 3 apples are left! 5 - 2 = 3!"
  },
  {
    keywords: ['multiplication','multiply','times table'],
    reply: "Multiplication is fast addition! ✖️ 3 × 4 means 3 groups of 4 things (4 + 4 + 4 = 12). Easy tricks: × 1 keeps the number, × 2 doubles it!"
  },
  {
    keywords: ['noun','nouns'],
    reply: "A noun is a naming word! 🏷️ It names a Person (teacher), Place (school), Animal (cat 🐱), or Thing (book 📚). Proper nouns like your name start with a CAPITAL letter!"
  },
  {
    keywords: ['verb','verbs'],
    reply: "A verb is an action word! ⚡ It tells what someone DOES: run 🏃, jump 🦘, read 📖, sleep 😴, dance 💃. Every sentence MUST have a verb!"
  },
  {
    keywords: ['adjective','adjectives'],
    reply: "An adjective is a describing word! 🎨 It tells size (big, small), colour (red, blue), texture (fluffy), or feeling (happy). Example: 'A FLUFFY white kitten'."
  },
]

function keywordFallback(message) {
  const lower = message.toLowerCase()

  // First check if user is asking about a specific lesson from local lesson data
  try {
    const allLessons = getAllLessons()
    const matchedLesson = allLessons.find(l =>
      lower.includes(l.title.toLowerCase()) ||
      l.keyPoints.some(kp => lower.includes(kp.toLowerCase()))
    )
    if (matchedLesson) {
      return `📖 **${matchedLesson.emoji} ${matchedLesson.title}** (${matchedLesson.subject.toUpperCase()})\n\n${matchedLesson.content}\n\n---\n💡 **Activity:** ${matchedLesson.activity}`
    }
  } catch (err) {
    // fallback if import issue
  }

  // Check OFFLINE_RESPONSES
  for (const entry of OFFLINE_RESPONSES) {
    if (entry.keywords.some(k => lower.includes(k))) return entry.reply
  }

  return "That's a wonderful question! 🤔 I'm currently running in offline mode. You can ask me about **Math 🔢**, **English 📖**, **Science 🔬**, **Social Studies 🗺️**, or **Memory 🧠**! Or say 'Start lesson' to learn step by step! 📚"
}

// ──────────────────────────────────────────────
// Check if Ollama is reachable
// ──────────────────────────────────────────────
export async function checkOllamaStatus() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: AbortSignal.timeout(2000)
    })
    if (!res.ok) return { running: false, models: [] }
    const data = await res.json()
    const models = (data.models || []).map(m => m.name)
    return { running: true, models }
  } catch {
    return { running: false, models: [] }
  }
}

// ──────────────────────────────────────────────
// Get the stored model name (default: gemma2:2b)
// ──────────────────────────────────────────────
export function getStoredModel() {
  return localStorage.getItem('neurolex_ollama_model') || DEFAULT_MODEL
}

export function setStoredModel(model) {
  localStorage.setItem('neurolex_ollama_model', model)
}

// ──────────────────────────────────────────────
// Build conversation context for Ollama
// ──────────────────────────────────────────────
function buildPrompt(messages, userMessage, difficultyLevel = 'normal') {
  const difficultyNote = difficultyLevel === 'easy'
    ? '\n\nIMPORTANT: The student asked for an easier explanation. Use the simplest possible words. Short sentences only.'
    : difficultyLevel === 'hard'
    ? '\n\nIMPORTANT: The student is ready for more challenge. Add a bit more detail and depth to your response.'
    : ''

  // Build conversation history as a formatted string for Ollama
  const history = messages.slice(-6).map(m =>
    m.role === 'user' ? `Student: ${m.content}` : `NeuroLex: ${m.content}`
  ).join('\n')

  return `${SYSTEM_PROMPT}${difficultyNote}\n\n${history}\nStudent: ${userMessage}\nNeuroLex:`
}

// ──────────────────────────────────────────────
// Main: Send message to local LLM
// ──────────────────────────────────────────────
export async function sendLocalLLMMessage(messages, userMessage, options = {}) {
  const model = options.model || getStoredModel()
  const difficultyLevel = options.difficultyLevel || 'normal'

  // Check Ollama availability
  const status = await checkOllamaStatus()

  if (!status.running) {
    // Return keyword fallback — do NOT call any cloud API
    await new Promise(r => setTimeout(r, 400)) // small UX delay
    return {
      text: keywordFallback(userMessage),
      source: 'offline-keyword',
      error: 'Ollama not running'
    }
  }

  // Check if requested model is available
  const modelAvailable = status.models.some(m =>
    m === model || m.startsWith(model.split(':')[0])
  )

  if (!modelAvailable) {
    return {
      text: `⚠️ The AI model "${model}" is not installed yet. Please open a terminal and run:\n\n  ollama pull ${model}\n\nThen come back and try again! Meanwhile, I'll use my basic knowledge to help you. 😊\n\n${keywordFallback(userMessage)}`,
      source: 'offline-keyword',
      error: `Model ${model} not found`
    }
  }

  try {
    const prompt = buildPrompt(messages, userMessage, difficultyLevel)

    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
          num_predict: 200,  // keep responses short
          stop: ['Student:', '\n\n\n'],
        }
      }),
      signal: AbortSignal.timeout(30000) // 30s timeout
    })

    if (!res.ok) {
      throw new Error(`Ollama returned ${res.status}`)
    }

    const data = await res.json()
    const text = (data.response || '').trim()

    if (!text) {
      return { text: keywordFallback(userMessage), source: 'offline-keyword' }
    }

    return { text, source: 'ollama', model }

  } catch (err) {
    console.warn('[NeuroLite] Local LLM error:', err.message)
    return {
      text: keywordFallback(userMessage),
      source: 'offline-keyword',
      error: err.message
    }
  }
}
