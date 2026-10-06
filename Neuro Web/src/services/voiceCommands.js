/**
 * NeuroLite Voice Command Intent Detection
 * Detects 14 built-in voice commands from speech transcripts.
 * Falls through to 'FREE_QUESTION' if no command matches.
 */

export const INTENTS = {
  START_LESSON:     'START_LESSON',
  NEXT_LESSON:      'NEXT_LESSON',
  PREV_LESSON:      'PREV_LESSON',
  START_QUIZ:       'START_QUIZ',
  REPEAT:           'REPEAT',
  READ_THIS:        'READ_THIS',
  EXPLAIN_THIS:     'EXPLAIN_THIS',
  MAKE_EASIER:      'MAKE_EASIER',
  MAKE_HARDER:      'MAKE_HARDER',
  SHOW_PROGRESS:    'SHOW_PROGRESS',
  GO_HOME:          'GO_HOME',
  STOP_READING:     'STOP_READING',
  TRANSLATE_TAMIL:  'TRANSLATE_TAMIL',
  HELP_ME:          'HELP_ME',
  FREE_QUESTION:    'FREE_QUESTION',
}

// Each intent has specific phrase patterns to prevent intercepting real subject questions
const INTENT_PATTERNS = [
  {
    intent: INTENTS.START_LESSON,
    patterns: [
      /^(start|begin|open) (a |the |my )?lesson$/i,
      /^(let's|let us) (start|begin) (a |the |my )?lesson$/i,
      /^i want to start a lesson$/i,
    ]
  },
  {
    intent: INTENTS.NEXT_LESSON,
    patterns: [
      /^(next|go to next|next lesson|next topic|next page)$/i,
      /^(move on|continue|show me next)$/i,
    ]
  },
  {
    intent: INTENTS.PREV_LESSON,
    patterns: [
      /^(previous|prev|previous lesson|last lesson|go back)$/i,
      /^(back to previous|show me previous)$/i,
    ]
  },
  {
    intent: INTENTS.START_QUIZ,
    patterns: [
      /^(start|begin|take) (a |the )?quiz$/i,
      /^(quiz time|let's do a quiz|test me)$/i,
    ]
  },
  {
    intent: INTENTS.REPEAT,
    patterns: [
      /^(repeat|say that again|can you repeat|please say again|again please|once more)$/i,
    ]
  },
  {
    intent: INTENTS.READ_THIS,
    patterns: [
      /^(read this|read it|read that|read aloud|read out loud|read to me|please read)$/i,
    ]
  },
  {
    intent: INTENTS.EXPLAIN_THIS,
    patterns: [
      /^(explain this|explain that|explain it|explain more|what does this mean|can you explain this)$/i,
    ]
  },
  {
    intent: INTENTS.MAKE_EASIER,
    patterns: [
      /^(make it easier|simplify|easier please|make it simpler|too hard)$/i,
    ]
  },
  {
    intent: INTENTS.MAKE_HARDER,
    patterns: [
      /^(make it harder|harder please|challenge me|more challenging|increase difficulty)$/i,
    ]
  },
  {
    intent: INTENTS.SHOW_PROGRESS,
    patterns: [
      /^(show my progress|my progress|my score|how many points do i have|what is my level|my stats)$/i,
    ]
  },
  {
    intent: INTENTS.GO_HOME,
    patterns: [
      /^(go home|go to dashboard|take me home|back to dashboard|open home)$/i,
    ]
  },
  {
    intent: INTENTS.STOP_READING,
    patterns: [
      /^(stop reading|stop speaking|stop talking|be quiet|silence|stop voice|shut up|mute)$/i,
    ]
  },
  {
    intent: INTENTS.TRANSLATE_TAMIL,
    patterns: [
      /^(translate to tamil|say it in tamil|in tamil|tamil please)$/i,
      /^(தமிழ்|தமிழில் பேசு)$/,
    ]
  },
  {
    intent: INTENTS.HELP_ME,
    patterns: [
      /^(help|help me|what can you do|what commands can i say|show commands|voice commands)$/i,
    ]
  },
]

/**
 * Detect intent from a voice transcript.
 * @param {string} transcript - Raw speech transcript
 * @returns {{ intent: string, raw: string }}
 */
export function detectIntent(transcript) {
  if (!transcript || typeof transcript !== 'string') {
    return { intent: INTENTS.FREE_QUESTION, raw: '' }
  }

  const text = transcript.trim()

  for (const { intent, patterns } of INTENT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return { intent, raw: text }
      }
    }
  }

  return { intent: INTENTS.FREE_QUESTION, raw: text }
}

/**
 * Human-readable descriptions of each intent (for the help command)
 */
export const VOICE_COMMAND_HELP = [
  { command: '"Start lesson"',       action: 'Begin learning a new lesson' },
  { command: '"Next lesson"',        action: 'Go to the next lesson or topic' },
  { command: '"Previous lesson"',    action: 'Go back to the previous lesson' },
  { command: '"Start quiz"',         action: 'Begin a quiz on the current topic' },
  { command: '"Repeat"',             action: 'Repeat the last message or explanation' },
  { command: '"Read this"',          action: 'Read the current content aloud' },
  { command: '"Explain this"',       action: 'Get a deeper explanation of the topic' },
  { command: '"Make it easier"',     action: 'Simplify the explanation' },
  { command: '"Make it harder"',     action: 'Get a more challenging explanation' },
  { command: '"Show my progress"',   action: 'See your points, level and achievements' },
  { command: '"Go home"',            action: 'Return to the main dashboard' },
  { command: '"Stop reading"',       action: 'Stop the voice from speaking' },
  { command: '"Translate to Tamil"', action: 'Switch responses to Tamil language' },
  { command: '"Help me"',            action: 'Show all available voice commands' },
]
