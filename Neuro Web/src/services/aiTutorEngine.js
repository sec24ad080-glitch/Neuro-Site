/**
 * NeuroLite AI Tutor Intelligent Engine
 * Provides instant, neurodiverse-adapted, multi-subject answers for:
 * - Mathematics (dynamic arithmetic solver, fractions, geometry, word problems, visual counters)
 * - English (phonics, vowels, parts of speech, rhyming words, opposites, plurals, sentence building)
 * - Science (solar system, photosynthesis, human body, water cycle, animals, ecosystems, states of matter)
 * - Social Studies (geography, maps, community helpers, history)
 * - Brain & Focus (breathing, encouragement, interactive riddles & quizzes)
 */

import { getAllLessons } from '../data/lessons/index.js'

// ──────────────────────────────────────────────
// Math Arithmetic & Word Problem Solver
// ──────────────────────────────────────────────
function solveMathProblem(input) {
  const text = input.toLowerCase().trim()

  // Match direct arithmetic expressions e.g., "5 + 7", "24 / 4", "12 * 8", "15 - 9", "what is 25 + 13"
  // Clean string to find numbers and operator
  const cleanMath = text.replace(/what is|calculate|solve|how much is|\?|equals|equal to/gi, '').trim()
  
  // Check for simple basic operators: +, -, *, x, /, ÷
  const opMatch = cleanMath.match(/^(\d+(?:\.\d+)?)\s*([\+\-\*\/xX÷])\s*(\d+(?:\.\d+)?)$/)
  if (opMatch) {
    const num1 = parseFloat(opMatch[1])
    const op = opMatch[2]
    const num2 = parseFloat(opMatch[3])
    return generateMathResponse(num1, op, num2)
  }

  // Word matches: "add 15 and 20", "sum of 8 and 9"
  const addMatch = text.match(/(?:add|sum of)\s+(\d+(?:\.\d+)?)\s+(?:and|\+)\s+(\d+(?:\.\d+)?)/i)
  if (addMatch) {
    return generateMathResponse(parseFloat(addMatch[1]), '+', parseFloat(addMatch[2]))
  }

  // "subtract 5 from 12"
  const subFromMatch = text.match(/subtract\s+(\d+(?:\.\d+)?)\s+from\s+(\d+(?:\.\d+)?)/i)
  if (subFromMatch) {
    return generateMathResponse(parseFloat(subFromMatch[2]), '-', parseFloat(subFromMatch[1]))
  }

  // "12 minus 5" or "subtract 5 and 12"
  const subMatch = text.match(/(?:subtract|minus|difference between)\s+(\d+(?:\.\d+)?)\s+(?:and|from|minus|\-)\s+(\d+(?:\.\d+)?)/i)
  if (subMatch) {
    return generateMathResponse(parseFloat(subMatch[1]), '-', parseFloat(subMatch[2]))
  }

  // "multiply 6 and 7" or "6 times 7"
  const multMatch = text.match(/(?:multiply|product of)\s+(\d+(?:\.\d+)?)\s+(?:and|by|times|\*)\s+(\d+(?:\.\d+)?)/i)
  if (multMatch) {
    return generateMathResponse(parseFloat(multMatch[1]), '*', parseFloat(multMatch[2]))
  }

  // "divide 20 by 4"
  const divMatch = text.match(/divide\s+(\d+(?:\.\d+)?)\s+(?:by|\/)\s+(\d+(?:\.\d+)?)/i)
  if (divMatch) {
    return generateMathResponse(parseFloat(divMatch[1]), '/', parseFloat(divMatch[2]))
  }

  // "half of 24"
  const halfMatch = text.match(/half of\s+(\d+(?:\.\d+)?)/i)
  if (halfMatch) {
    const n = parseFloat(halfMatch[1])
    return `Half of ${n} is **${n / 2}**! 🍕\n\nWhen we divide ${n} into two equal parts: ${n} ÷ 2 = **${n / 2}**. Great job! ⭐`
  }

  // "double of 15"
  const doubleMatch = text.match(/double (?:of\s+)?(\d+(?:\.\d+)?)/i)
  if (doubleMatch) {
    const n = parseFloat(doubleMatch[1])
    return `Double of ${n} is **${n * 2}**! 🚀\n\nDoubling means multiplying by 2: ${n} + ${n} = **${n * 2}**!`
  }

  // Times table requests like "7 times table" or "table of 5"
  const tableMatch = text.match(/(?:table of|times table for|(\d+)\s+times table)/i)
  if (tableMatch) {
    const tableNum = parseInt(text.match(/\d+/)?.[0] || '5')
    if (tableNum > 0 && tableNum <= 20) {
      let lines = []
      for (let i = 1; i <= 10; i++) {
        lines.push(`${tableNum} × ${i} = ${tableNum * i}`)
      }
      return `🔢 **Here is the ${tableNum} Times Table:**\n\n${lines.join('\n')}\n\n💡 Tip: Notice the pattern of adding +${tableNum} each step!`
    }
  }

  return null
}

function generateMathResponse(n1, op, n2) {
  let result = 0
  let symbol = '+'
  let explanation = ''
  let visual = ''

  if (op === '+' || op === 'add') {
    result = n1 + n2
    symbol = '+'
    if (n1 <= 10 && n2 <= 10 && Number.isInteger(n1) && Number.isInteger(n2)) {
      visual = `\nVisual counting: ${'🍎'.repeat(n1)} + ${'🍎'.repeat(n2)} = ${'🍎'.repeat(result)}`
    }
    explanation = `When we add **${n1}** and **${n2}**, we combine them together to get **${result}**! 🎉${visual}`
  } else if (op === '-' || op === 'minus') {
    result = n1 - n2
    symbol = '−'
    if (n1 <= 15 && n2 <= n1 && Number.isInteger(n1) && Number.isInteger(n2)) {
      visual = `\nVisual takeaway: Start with ${'🍪'.repeat(n1)}, take away ${n2} 🍪 → Left with ${'🍪'.repeat(result)}`
    }
    explanation = `When we take **${n2}** away from **${n1}**, we have **${result}** left! 🍪${visual}`
  } else if (op === '*' || op === 'x' || op === 'X') {
    result = n1 * n2
    symbol = '×'
    if (n1 <= 6 && n2 <= 6 && Number.isInteger(n1) && Number.isInteger(n2)) {
      const groups = Array(n1).fill('⭐'.repeat(n2)).join(' + ')
      visual = `\nVisual groups: ${n1} groups of ${n2} stars: (${groups}) = ${result} ⭐`
    }
    explanation = `**${n1} × ${n2} = ${result}**! 🌟 Multiplication is fast adding: ${n1} groups of ${n2}.${visual}`
  } else if (op === '/' || op === '÷') {
    if (n2 === 0) {
      return "Oops! We cannot divide by 0! 🛑 That would be like sharing cookies among 0 people!"
    }
    result = Number((n1 / n2).toFixed(2))
    symbol = '÷'
    explanation = `**${n1} ÷ ${n2} = ${result}**! 🍕 Dividing means sharing ${n1} equally into ${n2} groups.`
  }

  return `🔢 **Math Solution:**\n\n# ${n1} ${symbol} ${n2} = **${result}**\n\n${explanation}\n\n⭐ Great question! Would you like another math problem?`
}

// ──────────────────────────────────────────────
// Comprehensive Subject Knowledge Base
// ──────────────────────────────────────────────
const SUBJECT_KNOWLEDGE = [
  // ── ENGLISH TOPICS ──
  {
    keywords: ['vowel', 'vowels', 'what are vowels'],
    subject: 'English',
    icon: '🔤',
    title: 'The 5 Vowels',
    reply: `🔤 **The 5 Vowels are A, E, I, O, U!** (and sometimes Y)\n\n• **A** as in 🍎 Apple\n• **E** as in 🐘 Elephant\n• **I** as in 🍦 Ice cream\n• **O** as in 🐙 Octopus\n• **U** as in ☂️ Umbrella\n\n💡 *Fun Fact:* Every English word must have at least one vowel sound to be spoken easily!`
  },
  {
    keywords: ['noun', 'nouns', 'what is a noun'],
    subject: 'English',
    icon: '🏷️',
    title: 'Nouns (Naming Words)',
    reply: `🏷️ **A Noun is a NAMING word!**\n\nIt names:\n• **Person:** Teacher 👩‍🏫, Doctor 👨‍⚕️, Mom 👩\n• **Place:** School 🏫, Park 🌳, Beach 🏖️\n• **Animal:** Dog 🐶, Cat 🐱, Lion 🦁\n• **Thing:** Book 📖, Pencil ✏️, Ball ⚽\n\n⭐ *Sentence example:* "The **cat** sat on the **mat**." (Cat & Mat are nouns!)`
  },
  {
    keywords: ['verb', 'verbs', 'what is a verb', 'action word'],
    subject: 'English',
    icon: '⚡',
    title: 'Verbs (Action Words)',
    reply: `⚡ **A Verb is an ACTION word!**\n\nIt tells what someone or something DOES:\n• Run 🏃\n• Jump 🦘\n• Read 📖\n• Sing 🎤\n• Sleep 😴\n\n💡 *Rule:* Every complete sentence must have at least one verb! Example: "Birds **fly** in the sky."`
  },
  {
    keywords: ['adjective', 'adjectives', 'what is an adjective', 'describing word'],
    subject: 'English',
    icon: '🎨',
    title: 'Adjectives (Describing Words)',
    reply: `🎨 **An Adjective is a DESCRIBING word!**\n\nIt tells us more about a noun:\n• **Colour:** A **red** apple 🍎\n• **Size:** A **huge** dinosaur 🦕\n• **Feel:** A **soft** puppy 🐶\n• **Taste:** A **sweet** strawberry 🍓\n\n⭐ Example: "The **fluffy** white bunny hopped." (Fluffy and White describe the bunny!)`
  },
  {
    keywords: ['rhyme', 'rhyming', 'rhymes with cat', 'rhymes with sun'],
    subject: 'English',
    icon: '🎶',
    title: 'Rhyming Words',
    reply: `🎶 **Rhyming words have the same ending sound!**\n\n• **-at family:** Cat 🐱, Bat 🦇, Hat 🎩, Mat 🧶, Rat 🐀\n• **-un family:** Sun ☀️, Run 🏃, Fun 🎉, Bun 🍞\n• **-ight family:** Night 🌙, Bright ✨, Light 💡, Kite 🪁\n\nCan you think of a word that rhymes with **DOG**? (Hint: F_ _ or L_ _)`
  },
  {
    keywords: ['opposite', 'opposites', 'antonym', 'antonyms'],
    subject: 'English',
    icon: '↔️',
    title: 'Opposite Words',
    reply: `↔️ **Opposites (Antonyms) are words with reverse meanings!**\n\n• Hot ☀️ ↔️ Cold ❄️\n• Big 🐘 ↔️ Small 🐜\n• Happy 😊 ↔️ Sad 😢\n• Fast 🐆 ↔️ Slow 🐢\n• Up ⬆️ ↔️ Down ⬇️\n• Day 🌞 ↔️ Night 🌙\n\nWhat is the opposite of **DARK**? That's right: **LIGHT**! 💡`
  },
  {
    keywords: ['sentence', 'how to write a sentence', 'punctuation'],
    subject: 'English',
    icon: '✍️',
    title: 'Building a Great Sentence',
    reply: `✍️ **The 3 Golden Rules of a Great Sentence:**\n\n1. **Capital Letter:** Always start with a big letter (e.g., "The...")\n2. **Finger Spaces:** Leave space between each word so it is easy to read.\n3. **Punctuation at the End:** Use a period (**.**), question mark (**?**), or exclamation (**!**).\n\nExample: *The clever puppy found a shiny bone!* 🐶`
  },

  // ── MATH TOPICS ──
  {
    keywords: ['fraction', 'fractions', 'what is a fraction', 'numerator', 'denominator'],
    subject: 'Math',
    icon: '🍕',
    title: 'Understanding Fractions',
    reply: `🍕 **Fractions are equal parts of a whole!**\n\nImagine a delicious pizza cut into **4 equal slices**:\n• If you eat **1 slice**, you ate **1/4** (one quarter).\n• If you eat **2 slices**, you ate **2/4 = 1/2** (one half)!\n\n📌 **Top number (Numerator):** How many parts you have.\n📌 **Bottom number (Denominator):** Total parts in the whole pizza!`
  },
  {
    keywords: ['shape', 'shapes', 'geometry', 'triangle', 'square', 'circle', 'rectangle'],
    subject: 'Math',
    icon: '🔷',
    title: '2D & 3D Shapes',
    reply: `🔷 **Shapes Around Us:**\n\n• ⭕ **Circle:** 0 straight sides, 0 corners. Perfectly round like a coin!\n• 🟥 **Square:** 4 equal straight sides and 4 square corners.\n• 🔺 **Triangle:** 3 sides and 3 sharp corners.\n• 🔲 **Rectangle:** 4 sides (2 long, 2 short) and 4 corners.\n• 📦 **Cube (3D):** Like a dice with 6 square faces!`
  },
  {
    keywords: ['perimeter', 'area', 'how to find perimeter', 'how to find area'],
    subject: 'Math',
    icon: '📐',
    title: 'Perimeter vs Area',
    reply: `📐 **Perimeter vs Area Made Super Easy:**\n\n• **Perimeter:** The distance *around the outside* fence! (Add all sides together: side + side + side + side)\n• **Area:** The space *inside* the shape! (For a rectangle: Length × Width)\n\nExample: A square of side 3cm has:\nPerimeter = 3 + 3 + 3 + 3 = **12cm**\nArea = 3 × 3 = **9 square cm**! 🟩`
  },
  {
    keywords: ['count by 2', 'skip count', 'skip counting', 'even odd', 'even numbers', 'odd numbers'],
    subject: 'Math',
    icon: '🔢',
    title: 'Skip Counting & Even/Odd',
    reply: `🔢 **Skip Counting is like hopping over numbers!**\n\n• **Count by 2s:** 2, 4, 6, 8, 10, 12, 14, 16, 18, 20... (All EVEN numbers!)\n• **Count by 5s:** 5, 10, 15, 20, 25, 30, 35, 40, 45, 50!\n• **Count by 10s:** 10, 20, 30, 40, 50, 60, 70, 80, 90, 100! 💯\n\n💡 *Even numbers* can be shared equally between 2 friends without leftovers!`
  },

  // ── SCIENCE TOPICS ──
  {
    keywords: ['photosynthesis', 'how plants make food', 'plant food', 'chlorophyll'],
    subject: 'Science',
    icon: '🌿',
    title: 'How Plants Eat (Photosynthesis)',
    reply: `🌿 **Photosynthesis is how plants cook food using sunlight!**\n\nPlants mix 3 ingredients:\n1. ☀️ **Sunlight** (captured by green leaves called chlorophyll)\n2. 💧 **Water** (drank from soil by roots)\n3. 💨 **Carbon Dioxide** (breathed in from air)\n\n✨ **Magic Result:** They make yummy Glucose (sugar) to grow, and release fresh **Oxygen 🌬️** for you and me to breathe!`
  },
  {
    keywords: ['solar system', 'planet', 'planets', 'sun', 'moon', 'space', 'mars', 'jupiter'],
    subject: 'Science',
    icon: '🪐',
    title: 'The 8 Planets in Our Solar System',
    reply: `🪐 **Our Solar System has 8 planets orbiting the Sun!**\n\nFrom closest to the Sun to farthest:\n1. 🪨 **Mercury** — Smallest & fastest\n2. 🌋 **Venus** — Hottest planet\n3. 🌍 **Earth** — Our wonderful home with water & life\n4. 🔴 **Mars** — The red dusty planet\n5. 👑 **Jupiter** — The giant king planet\n6. 💍 **Saturn** — Famous for its sparkling rings\n7. 🧊 **Uranus** — The icy planet spinning on its side\n8. 🌊 **Neptune** — Windy, dark blue ice giant\n\n🚀 *Memory Trick:* **M**y **V**ery **E**ducated **M**other **J**ust **S**erved **U**s **N**oodles!`
  },
  {
    keywords: ['water cycle', 'rain', 'clouds', 'evaporation', 'condensation', 'precipitation'],
    subject: 'Science',
    icon: '💧',
    title: 'The Water Cycle',
    reply: `💧 **The Water Cycle Never Stops Travelling!**\n\n1. ☀️ **Evaporation:** The warm Sun heats water in oceans & rivers into invisible water vapour.\n2. ☁️ **Condensation:** Vapour floats high up, cools down, and forms fluffy clouds.\n3. 🌧️ **Precipitation:** Clouds get heavy and water falls back down as rain or snow!\n4. 🌊 **Collection:** Rain flows back into rivers, lakes, and oceans. Then it repeats!`
  },
  {
    keywords: ['human body', 'heart', 'brain', 'lungs', 'skeleton', 'bones', 'senses', '5 senses'],
    subject: 'Science',
    icon: '🧠',
    title: 'The Human Body & 5 Senses',
    reply: `🧠 **Your Body is a Super Machine!**\n\n• 🧠 **Brain:** The boss computer that controls every thought and movement.\n• ❤️ **Heart:** An tireless pump beating ~100,000 times a day to push blood.\n• 🫁 **Lungs:** Two sponges that bring oxygen into your body.\n• 🦴 **Skeleton:** 206 strong bones that protect you and help you stand tall!\n\n👀 **5 Senses:** Sight 👁️, Hearing 👂, Smell 👃, Taste 👅, Touch ✋!`
  },
  {
    keywords: ['living non living', 'living things', 'living vs non living'],
    subject: 'Science',
    icon: '🌱',
    title: 'Living vs Non-Living Things',
    reply: `🌱 **Living vs Non-Living Things:**\n\n✅ **Living Things (Animals, Plants, Humans):**\n• Need food & water 💧\n• Breathe air 🌬️\n• Grow and change 📈\n• Move on their own 🏃\n\n❌ **Non-Living Things (Rocks, Toys, Cars):**\n• Do not eat, breathe, or grow!\n• Example: A pencil is non-living, but a tree is living! 🌳`
  },

  // ── SOCIAL STUDIES ──
  {
    keywords: ['community helper', 'community helpers', 'doctor', 'police', 'firefighter'],
    subject: 'Social Studies',
    icon: '🚒',
    title: 'Community Helpers',
    reply: `🚒 **Community Helpers make our neighbourhoods safe & happy:**\n\n• 👨‍⚕️ **Doctors & Nurses:** Care for our health when we feel sick.\n• 🧑‍🚒 **Firefighters:** Put out fires and rescue pets and people.\n• 👮 **Police Officers:** Keep our streets peaceful and safe.\n• 👩‍🏫 **Teachers:** Guide us to learn new ideas every day.\n• 🧹 **Sanitation Workers:** Keep our towns clean and fresh!`
  },
  {
    keywords: ['map', 'maps', 'compass', 'north south east west', 'cardinal directions'],
    subject: 'Social Studies',
    icon: '🗺️',
    title: 'Reading Maps & Directions',
    reply: `🗺️ **Reading a Map with the 4 Directions:**\n\n• ⬆️ **North (N)** — Top\n• ➡️ **East (E)** — Right (Where the Sun rises! 🌅)\n• ⬇️ **South (S)** — Bottom\n• ⬅️ **West (W)** — Left (Where the Sun sets! 🌇)\n\n🧭 *Remember:* **N**ever **E**at **S**oggy **W**affles (**N, E, S, W**)!`
  },

  // ── INTERACTIVE QUIZZES & RIDDLES ──
  {
    keywords: ['riddle', 'tell me a riddle', 'give me a riddle'],
    subject: 'Fun',
    icon: '🧩',
    title: 'Fun Learning Riddle',
    reply: `🧩 **Here is a brain-tickling riddle for you:**\n\n*"I have hands and a face, but no arms or legs. What am I?"*\n\n...\n...\n...\n⏰ **Answer:** A CLOCK! 🕰️ (It has an hour hand, minute hand, and a clock face!)\n\nWould you like another riddle? 🌟`
  },
  {
    keywords: ['quiz me on math', 'math quiz', 'give me a math problem'],
    subject: 'Math',
    icon: '🎯',
    title: 'Mini Math Challenge',
    reply: `🎯 **Quick Math Challenge for You:**\n\n🌟 *You have 4 red balloons 🎈🎈🎈🎈 and your friend gives you 5 blue balloons 🎈🎈🎈🎈🎈. How many balloons do you have in total?*\n\nType your answer: (Hint: 4 + 5 = ?)`
  },
  {
    keywords: ['quiz me on english', 'english quiz', 'word challenge'],
    subject: 'English',
    icon: '🎯',
    title: 'Mini English Challenge',
    reply: `🎯 **Quick English Word Challenge:**\n\nWhich word is a **VERB** (action word)?\n\n1. 🐱 Cat\n2. 🏃 Run\n3. 🍎 Apple\n\nTell me which number you choose!`
  }
]

// ──────────────────────────────────────────────
// Main Smart Fallback Query Handler
// ──────────────────────────────────────────────
export function getSmartSubjectAnswer(userMessage) {
  const query = userMessage.trim().toLowerCase()

  // 1. Try mathematical solver first
  const mathAnswer = solveMathProblem(query)
  if (mathAnswer) return mathAnswer

  // 2. Check lessons catalog
  try {
    const allLessons = getAllLessons()
    const matchedLesson = allLessons.find(l =>
      query.includes(l.title.toLowerCase()) ||
      (l.keyPoints && l.keyPoints.some(kp => query.includes(kp.toLowerCase())))
    )
    if (matchedLesson) {
      return `📖 **${matchedLesson.emoji} ${matchedLesson.title}** (${matchedLesson.subject.toUpperCase()})\n\n${matchedLesson.content}\n\n---\n💡 **Fun Activity:** ${matchedLesson.activity}`
    }
  } catch (e) {
    // Continue
  }

  // 3. Match subject knowledge base with keyword scoring
  let bestMatch = null
  let highestScore = 0

  for (const item of SUBJECT_KNOWLEDGE) {
    let score = 0
    for (const kw of item.keywords) {
      if (query.includes(kw)) {
        score += kw.length
      }
    }
    if (score > highestScore) {
      highestScore = score
      bestMatch = item
    }
  }

  if (bestMatch && highestScore > 0) {
    return bestMatch.reply
  }

  // 4. Default welcoming neurodiverse response with direct suggestions
  return `🌟 That's a great question! I'm ready to help you learn anything in:\n\n• **Math 🔢**: Try asking "What is 15 + 8", "Explain fractions", or "Table of 6"\n• **English 📖**: Try asking "What are vowels", "Nouns vs verbs", or "Rhyming words"\n• **Science 🔬**: Try asking "How does photosynthesis work", "Tell me about solar system", or "Water cycle"\n• **Fun 🎮**: Try asking "Tell me a riddle" or "Quiz me on math"!\n\nWhat would you like to explore next? 😊`
}
