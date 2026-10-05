import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'

// ── Math Puzzle Game ──────────────────────────────────────────────
function MathGame({ onClose, addPoints }) {
  const [score,   setScore]   = useState(0)
  const [q,       setQ]       = useState(null)
  const [input,   setInput]   = useState('')
  const [feedback,setFeedback]= useState(null)
  const [timeLeft,setTimeLeft]= useState(30)
  const [active,  setActive]  = useState(true)

  const generate = () => {
    const ops = ['+', '-', '×']
    const op  = ops[Math.floor(Math.random() * ops.length)]
    const a   = Math.floor(Math.random() * 20) + 1
    const b   = Math.floor(Math.random() * 10) + 1
    const ans = op === '+' ? a + b : op === '-' ? a - b : a * b
    setQ({ text: `${a} ${op} ${b} = ?`, answer: ans })
    setInput('')
    setFeedback(null)
  }

  useEffect(() => { generate() }, [])

  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setActive(false); clearInterval(timer); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [active])

  const check = () => {
    if (parseInt(input) === q.answer) {
      setScore(s => s + 10)
      setFeedback('correct')
      setTimeout(generate, 600)
    } else {
      setFeedback('wrong')
    }
  }

  const timeColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : '#10b981'

  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h3 style={{ marginBottom: 6 }}>⚡ Math Speed Run</h3>
      <p style={{ marginBottom: 20, fontSize: '0.85rem' }}>Answer as many as you can in 30 seconds!</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span className="badge badge-amber">⭐ Score: {score}</span>
        <span className="badge" style={{ background: `${timeColor}22`, color: timeColor, border: `1px solid ${timeColor}44` }}>
          ⏱ {timeLeft}s
        </span>
      </div>

      {active ? (
        <>
          <div style={{
            background: 'rgba(99,102,241,0.1)', border: '2px solid rgba(99,102,241,0.25)',
            borderRadius: 20, padding: '28px', marginBottom: 20
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 16 }}>{q?.text}</div>
            <input
              className="input"
              type="number"
              placeholder="Your answer..."
              value={input}
              onChange={e => { setInput(e.target.value); setFeedback(null) }}
              onKeyDown={e => e.key === 'Enter' && check()}
              style={{ maxWidth: 200, textAlign: 'center', fontSize: '1.2rem' }}
              autoFocus
            />
          </div>
          {feedback && (
            <div className="animate-scaleIn" style={{ marginBottom: 14, fontSize: '1.2rem', color: feedback === 'correct' ? '#34d399' : '#f87171', fontWeight: 700 }}>
              {feedback === 'correct' ? '✅ Correct! +10' : '❌ Try again!'}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={check} disabled={!input}>Submit</button>
            <button className="btn btn-secondary" onClick={onClose}>Quit</button>
          </div>
        </>
      ) : (
        <div className="animate-scaleIn">
          <div style={{ fontSize: 48, marginBottom: 12 }}>{score >= 80 ? '🏆' : score >= 40 ? '🥈' : '🎯'}</div>
          <h3 className="gradient-text" style={{ marginBottom: 8 }}>Time's Up!</h3>
          <p style={{ marginBottom: 20 }}>You scored <strong style={{ color: '#f1f5f9' }}>{score} points</strong>!</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { setScore(0); setTimeLeft(30); setActive(true); generate() }}>
              🔄 Play Again
            </button>
            <button className="btn btn-secondary" onClick={() => { addPoints(score); onClose() }}>
              💾 Save & Exit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Word Match Game ───────────────────────────────────────────────
const WORD_PAIRS = [
  { word: 'CAT',   emoji: '🐱' }, { word: 'DOG',  emoji: '🐶' },
  { word: 'SUN',   emoji: '☀️' }, { word: 'MOON', emoji: '🌙' },
  { word: 'TREE',  emoji: '🌳' }, { word: 'FISH', emoji: '🐟' },
  { word: 'STAR',  emoji: '⭐' }, { word: 'BOOK', emoji: '📚' },
]

function WordGame({ onClose, addPoints }) {
  const pairs   = WORD_PAIRS.slice(0, 6)
  const cards   = [...pairs.map(p => ({ ...p, type: 'word' })), ...pairs.map(p => ({ ...p, type: 'emoji' }))]
    .sort(() => Math.random() - 0.5)
    .map((c, i) => ({ ...c, id: i, flipped: false, matched: false }))

  const [deck,    setDeck]    = useState(cards)
  const [sel,     setSel]     = useState([])
  const [moves,   setMoves]   = useState(0)
  const [matches, setMatches] = useState(0)

  const flip = (id) => {
    if (sel.length === 2) return
    const card = deck.find(c => c.id === id)
    if (!card || card.flipped || card.matched) return

    const newDeck = deck.map(c => c.id === id ? { ...c, flipped: true } : c)
    setDeck(newDeck)
    const newSel = [...sel, { ...card }]
    setSel(newSel)

    if (newSel.length === 2) {
      setMoves(m => m + 1)
      if (newSel[0].word === newSel[1].word) {
        setTimeout(() => {
          setDeck(d => d.map(c => c.word === newSel[0].word ? { ...c, matched: true } : c))
          setMatches(m => m + 1)
          setSel([])
        }, 500)
      } else {
        setTimeout(() => {
          setDeck(d => d.map(c => (c.id === newSel[0].id || c.id === newSel[1].id) && !c.matched ? { ...c, flipped: false } : c))
          setSel([])
        }, 900)
      }
    }
  }

  const done    = matches === pairs.length
  const pts     = Math.max(0, 100 - moves * 5)

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3>🃏 Word Match</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-indigo">Moves: {moves}</span>
          <span className="badge badge-green">✅ {matches}/{pairs.length}</span>
        </div>
      </div>

      {!done ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {deck.map(card => (
            <button
              key={card.id}
              onClick={() => flip(card.id)}
              style={{
                aspectRatio: '1',
                borderRadius: 14, cursor: card.matched ? 'default' : 'pointer',
                background: card.flipped || card.matched
                  ? card.matched ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)'
                  : 'rgba(255,255,255,0.06)',
                border: `2px solid ${card.matched ? 'rgba(16,185,129,0.5)' : card.flipped ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.3s ease',
                fontSize: card.type === 'emoji' ? '1.6rem' : '0.85rem',
                fontWeight: 700, color: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: card.matched ? 'scale(0.96)' : 'scale(1)',
              }}
            >
              {card.flipped || card.matched
                ? (card.type === 'emoji' ? card.emoji : card.word)
                : '?'}
            </button>
          ))}
        </div>
      ) : (
        <div className="animate-scaleIn" style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <h3 className="gradient-text" style={{ marginBottom: 8 }}>All Matched!</h3>
          <p style={{ marginBottom: 20 }}>Completed in <strong style={{ color: '#f1f5f9' }}>{moves} moves</strong> — {pts} points!</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { addPoints(pts); onClose() }}>
              💾 Claim Points!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Games Page ───────────────────────────────────────────────
const GAME_LIST = [
  { id: 'math',  title: 'Math Speed Run', icon: '⚡', desc: 'Solve math problems as fast as you can!', color: '#6366f1', difficulty: 'Easy' },
  { id: 'word',  title: 'Word Match',     icon: '🃏', desc: 'Match words to their emoji pairs!',       color: '#10b981', difficulty: 'Easy' },
]

export default function GamesPage() {
  const { addPoints, showNotification } = useApp()
  const [activeGame, setActiveGame] = useState(null)

  const handleClose = () => {
    setActiveGame(null)
    showNotification('Game complete! Well done! 🌟', 'success')
  }

  const handlePoints = (pts) => {
    if (pts > 0) addPoints(pts)
  }

  return (
    <div className="page-container">
      {activeGame ? (
        <div className="glass-card animate-scaleIn" style={{ maxWidth: 600, margin: '40px auto' }}>
          {activeGame === 'math' && <MathGame onClose={handleClose} addPoints={handlePoints} />}
          {activeGame === 'word' && <WordGame onClose={handleClose} addPoints={handlePoints} />}
        </div>
      ) : (
        <>
          <div className="animate-fadeInUp" style={{ marginBottom: 32 }}>
            <h1>🎮 <span className="gradient-text">Fun Games</span></h1>
            <p>Learning is more fun when it feels like play! Earn points and badges.</p>
          </div>

          <div className="grid-2" style={{ marginBottom: 32 }}>
            {GAME_LIST.map((g, i) => (
              <div key={g.id} className={`subject-card animate-fadeInUp delay-${i + 1}`} style={{
                background: `radial-gradient(ellipse at top left, ${g.color}15 0%, rgba(255,255,255,0.03) 70%)`,
                borderColor: `${g.color}30`,
                textAlign: 'left', cursor: 'default'
              }}>
                <div style={{ fontSize: 42, marginBottom: 14 }}>{g.icon}</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h3 style={{ color: '#f1f5f9', margin: 0 }}>{g.title}</h3>
                  <span className="badge badge-green" style={{ fontSize: '0.7rem', flexShrink: 0 }}>{g.difficulty}</span>
                </div>
                <p style={{ fontSize: '0.88rem', marginBottom: 18 }}>{g.desc}</p>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ background: `linear-gradient(135deg, ${g.color}, ${g.color}cc)` }}
                  onClick={() => setActiveGame(g.id)}
                >
                  🎮 Play Now
                </button>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>🏆</span>
            <div>
              <h4 style={{ margin: '0 0 4px', color: '#f1f5f9' }}>More Games Coming Soon!</h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Story Adventure, Spelling Bee, Science Quiz and more are on their way!</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
