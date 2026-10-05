// Chatbot service — uses Google Gemini API with offline fallback
import { getAllLessons } from '../data/lessons/index.js'
import { sendGeminiMessage } from './gemini.js'
import { getGeminiApiKey } from './storage.js'

const OFFLINE_RESPONSES = [
  { keywords: ['hello','hi','hey','hiya'], reply: "Hello! 👋 I'm NeuroLex, your learning buddy powered by Google Gemini! What would you like to ask or explore today? Math 🔢, English 📖, Science 🔬, Social Studies 🗺️, or Memory 🧠?" },
  { keywords: ['subject', 'subjects', 'topic', 'topics', 'list subjects'], reply: "Here are subjects you can explore! 📚\n\n🔢 **Mathematics**: Counting, Addition, Subtraction, Shapes, Multiplication, Fractions\n📖 **English**: Alphabet, Reading Phonics, Nouns, Verbs, Sentences, Adjectives\n🔬 **Science**: Living & Non-Living Things, Human Body, Photosynthesis, Water Cycle, Solar System\n🗺️ **Social Studies**: History, Maps, Countries, & Community\n🧠 **Memory & Focus**: Recall Games & Attention Exercises\n\nAsk me any question!" },
  { keywords: ['math','add','subtract','multiply','divide','number','count'], reply: "Math is fun! 🔢 We can learn: 1) Counting 2) Addition 3) Subtraction 4) Shapes 5) Multiplication 6) Fractions. Ask me about any of these!" },
  { keywords: ['read','reading','word','letter','english','spelling','alphabet'], reply: "Reading is a superpower! 📚 We can learn: 1) The Alphabet 2) Reading Simple Words 3) Nouns 4) Verbs 5) Sentences 6) Adjectives." },
  { keywords: ['science','experiment','nature','plant','animal','body','planet','space'], reply: "Science is all about curiosity! 🔬 Learn about: 1) Living Things 2) The Human Body 3) Photosynthesis 4) Water Cycle 5) Solar System." },
  { keywords: ['social studies','history','map','maps','country','geography'], reply: "Social Studies tells stories of people, maps, countries, and community! 🗺️ History is like a big adventure story!" },
  { keywords: ['memory','focus','brain','attention'], reply: "Train your brain! 🧠 Practice recall games, visual memory exercises, and step-by-step focus techniques." },
  { keywords: ['hard','difficult','cant','can\'t','help'], reply: "It's okay to find things hard! 💪 Everyone learns at their own pace. Try breaking the problem into smaller pieces." },
  { keywords: ['good','great','awesome','correct'], reply: "You're doing amazing! 🌟 Keep going — every correct answer makes you smarter!" },
  { keywords: ['wrong','mistake','fail'], reply: "Mistakes help us learn! 🧠 Every mistake is a step toward getting it right. Try again!" },
  { keywords: ['bored','boring'], reply: "Let's make it exciting! 🎮 Try the games section or challenge yourself with a harder quiz!" },
  { keywords: ['tired'], reply: "Take a short break! 🌈 Drink some water, stretch, and come back refreshed. You can do it!" },
]

function offlineFallback(message) {
  const lower = message.toLowerCase()
  try {
    const allLessons = getAllLessons()
    const matchedLesson = allLessons.find(l =>
      lower.includes(l.title.toLowerCase()) ||
      l.keyPoints.some(kp => lower.includes(kp.toLowerCase()))
    )
    if (matchedLesson) {
      return `📖 **${matchedLesson.emoji} ${matchedLesson.title}** (${matchedLesson.subject.toUpperCase()})\n\n${matchedLesson.content}\n\n---\n💡 **Activity:** ${matchedLesson.activity}`
    }
  } catch (e) {}

  for (const entry of OFFLINE_RESPONSES) {
    if (entry.keywords.some(k => lower.includes(k))) return entry.reply
  }
  return "That's a great question! 🤔 Ask me anything about Math 🔢, English 📖, Science 🔬, Social Studies 🗺️, or Memory 🧠!"
}

export async function sendChatMessage(messages, userMessage) {
  const apiKey = getGeminiApiKey()

  if (apiKey && navigator.onLine) {
    try {
      const reply = await sendGeminiMessage(messages, userMessage, apiKey)
      if (reply) return reply
    } catch (e) {
      console.warn('Gemini chat failed, falling back:', e)
    }
  }

  return offlineFallback(userMessage)
}

