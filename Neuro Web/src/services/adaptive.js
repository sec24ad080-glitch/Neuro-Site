// Adaptive learning engine — adjusts difficulty based on streaks
// Difficulty scale: 'easy' → 'medium' → 'hard'

const LEVELS   = ['easy', 'medium', 'hard']
const UP_STREAK   = 3   // consecutive correct answers to increase difficulty
const DOWN_STREAK = 2   // consecutive wrong answers to decrease difficulty

export function getInitialState(subject) {
  return { subject, difficulty: 'easy', correctStreak: 0, wrongStreak: 0, totalAnswered: 0, totalCorrect: 0 }
}

export function processAnswer(state, isCorrect) {
  const s = { ...state, totalAnswered: state.totalAnswered + 1 }

  if (isCorrect) {
    s.totalCorrect   = (s.totalCorrect || 0) + 1
    s.correctStreak  = (s.correctStreak || 0) + 1
    s.wrongStreak    = 0
    if (s.correctStreak >= UP_STREAK) {
      s.difficulty    = increaseDifficulty(s.difficulty)
      s.correctStreak = 0
    }
  } else {
    s.wrongStreak   = (s.wrongStreak || 0) + 1
    s.correctStreak = 0
    if (s.wrongStreak >= DOWN_STREAK) {
      s.difficulty  = decreaseDifficulty(s.difficulty)
      s.wrongStreak = 0
    }
  }
  return s
}

function increaseDifficulty(current) {
  const idx = LEVELS.indexOf(current)
  return LEVELS[Math.min(idx + 1, LEVELS.length - 1)]
}

function decreaseDifficulty(current) {
  const idx = LEVELS.indexOf(current)
  return LEVELS[Math.max(idx - 1, 0)]
}

export function getAccuracy(state) {
  if (!state.totalAnswered) return 0
  return Math.round((state.totalCorrect / state.totalAnswered) * 100)
}

export function getPointsForAnswer(isCorrect, difficulty) {
  if (!isCorrect) return 0
  return difficulty === 'hard' ? 30 : difficulty === 'medium' ? 20 : 10
}
