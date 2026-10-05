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

// Each intent has multiple phrase patterns to maximise recognition accuracy
const INTENT_PATTERNS = [
  {
    intent: INTENTS.START_LESSON,
    patterns: [
      /start (a |the |my )?lesson/i,
      /begin (a |the |my )?lesson/i,
      /open (a |the |my )?lesson/i,
      /let('s| us) (start|begin) (a |the |my )?lesson/i,
      /i want to (start|learn|begin)/i,
    ]
  },
  {
    intent: INTENTS.NEXT_LESSON,
    patterns: [
      /next (lesson|topic|page|section)/i,
      /go (to )?(the )?next/i,
      /continue/i,
      /move (on|forward|ahead)/i,
      /show me the next/i,
    ]
  },
  {
    intent: INTENTS.PREV_LESSON,
    patterns: [
      /previous (lesson|topic|page|section)/i,
      /go back/i,
      /back (to )?(the )?previous/i,
      /last (lesson|topic|page)/i,
      /show me the previous/i,
    ]
  },
  {
    intent: INTENTS.START_QUIZ,
    patterns: [
      /start (a |the )?quiz/i,
      /begin (a |the )?quiz/i,
      /take (a |the )?quiz/i,
      /quiz (me|time|start)/i,
      /test me/i,
      /let('s| us) do (a |the )?quiz/i,
    ]
  },
  {
    intent: INTENTS.REPEAT,
    patterns: [
      /repeat/i,
      /say that again/i,
      /can you repeat/i,
      /i didn't (hear|understand|get that)/i,
      /please say again/i,
      /again please/i,
      /once more/i,
    ]
  },
  {
    intent: INTENTS.READ_THIS,
    patterns: [
      /read (this|it|that|aloud|out loud)/i,
      /read to me/i,
      /please read/i,
      /read out/i,
      /say this/i,
    ]
  },
  {
    intent: INTENTS.EXPLAIN_THIS,
    patterns: [
      /explain (this|that|it|more|further)/i,
      /what does (this|that) mean/i,
      /i don't understand/i,
      /i do not understand/i,
      /can you explain/i,
      /help me understand/i,
      /what is this/i,
    ]
  },
  {
    intent: INTENTS.MAKE_EASIER,
    patterns: [
      /make it easier/i,
      /simplify/i,
      /too (hard|difficult|complex)/i,
      /simpler (please|way)?/i,
      /easier (please|version)?/i,
      /use easier words/i,
      /make (it |this )?(more )?simple/i,
    ]
  },
  {
    intent: INTENTS.MAKE_HARDER,
    patterns: [
      /make it harder/i,
      /more (difficult|challenging|advanced)/i,
      /harder (please)?/i,
      /increase (the )?difficulty/i,
      /challenge me/i,
      /something harder/i,
    ]
  },
  {
    intent: INTENTS.SHOW_PROGRESS,
    patterns: [
      /show (my |our )?(progress|score|points|level|stats|achievements)/i,
      /how (am i doing|many points|is my progress)/i,
      /what('s| is) my (level|score|progress|rank)/i,
      /my progress/i,
      /how (many |much )?(points|xp) do i have/i,
    ]
  },
  {
    intent: INTENTS.GO_HOME,
    patterns: [
      /go (to )?(the )?(home|main|start|dashboard)/i,
      /take me home/i,
      /back to (the )?(home|dashboard|start)/i,
      /open (home|dashboard)/i,
      /home (screen|page)?/i,
    ]
  },
  {
    intent: INTENTS.STOP_READING,
    patterns: [
      /stop (reading|speaking|talking)/i,
      /be quiet/i,
      /silence/i,
      /stop (the |your )?voice/i,
      /stop (it|that|now)/i,
      /shut up/i,
      /mute/i,
      /pause (reading|speaking)?/i,
    ]
  },
  {
    intent: INTENTS.TRANSLATE_TAMIL,
    patterns: [
      /translate (to |into )?tamil/i,
      /say (it |this |that )?in tamil/i,
      /in tamil/i,
      /tamil (please|version)?/i,
      /தமிழ்/,  // direct Tamil script input
    ]
  },
  {
    intent: INTENTS.HELP_ME,
    patterns: [
      /help (me)?/i,
      /i need help/i,
      /what can you do/i,
      /what (commands|can i say|should i say)/i,
      /how do you work/i,
      /instructions/i,
      /show (me )?(the )?commands/i,
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
