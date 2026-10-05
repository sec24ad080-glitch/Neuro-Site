import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { getInitialState, processAnswer, getPointsForAnswer, getAccuracy } from '../services/adaptive.js'
import { speak, stopSpeaking, startListening, getLangCode } from '../services/tts.js'
import { addHistoryEntry } from '../services/storage.js'
import { getLearnText } from '../data/learnText.js'

export default function QuizPage() {
  const { subject } = useParams()
  const navigate    = useNavigate()
  const { currentProfile, settings, addPoints, awardBadge, showNotification } = useApp()

  const [questions, setQuestions]     = useState([])
  const [qIndex, setQIndex]           = useState(0)
  const [selected, setSelected]       = useState(null)
  const [answered, setAnswered]       = useState(false)
  const [adaptive, setAdaptive]       = useState(getInitialState(subject))
  const [finished, setFinished]       = useState(false)
  const [totalPoints, setTotalPoints] = useState(0)
  const [listening, setListening]     = useState(false)
  const [interimText, setInterimText] = useState('')
  const recognitionRef                = useRef(null)
  const lang = getLangCode(settings.language)
  const txt  = getLearnText(settings?.language)

  // Load questions by subject & difficulty
  useEffect(() => {
    import(`../data/questions/${subject}.json`)
      .then(mod => {
        const all = mod.default.modules ? mod.default.modules.flatMap(m => m.questions) : mod.default
        const filtered = all.filter(q => q.difficulty === adaptive.difficulty || !q.difficulty)
        const shuffled  = [...filtered].sort(() => Math.random() - 0.5).slice(0, 10)
        setQuestions(shuffled.length > 0 ? shuffled : all.slice(0, 10))
      })
      .catch(() => { showNotification('Subject not found!', 'error'); navigate('/subjects') })
  }, [subject, adaptive.difficulty])

  const current = questions[qIndex]

  const handleSelect = (opt) => {
    if (answered) return
    setSelected(opt)
    setAnswered(true)
    const isCorrect = opt === current.answer
    const pts       = getPointsForAnswer(isCorrect, adaptive.difficulty)
    setTotalPoints(p => p + pts)
    const newAdaptive = processAnswer(adaptive, isCorrect)
    setAdaptive(newAdaptive)
    if (settings.ttsEnabled) speak(isCorrect ? txt.quiz_correct : `The answer is: ${current.answer}`, settings.speechRate, lang)
    if (isCorrect && newAdaptive.difficulty === 'hard' && pts > 0) awardBadge(`${subject} Expert`)
    addHistoryEntry(currentProfile?.id, { subject, question: current.question, correct: isCorrect, difficulty: adaptive.difficulty })
  }

  const handleNext = () => {
    stopSpeaking()
    if (qIndex + 1 >= questions.length) {
      const pts = addPoints(totalPoints)
      if (getAccuracy(adaptive) === 100) awardBadge('Perfect Score')
      if (totalPoints >= 100) awardBadge('High Scorer')
      setFinished(true)
    } else {
      setQIndex(i => i + 1)
      setSelected(null)
      setAnswered(false)
      setInterimText('')
    }
  }

  const handleSpeak = () => {
    if (current) speak(current.question, settings.speechRate, lang)
  }

  const handleVoiceAnswer = () => {
    if (listening) { recognitionRef.current?.stop(); return }
    setListening(true)
    setInterimText('')
    recognitionRef.current = startListening(
      (transcript) => {
        setListening(false)
        setInterimText('')
        // match transcript to one of the options
        const lower = transcript.toLowerCase().trim()
        const match = current.options?.find(o => o.toLowerCase().includes(lower) || lower.includes(o.toLowerCase().trim()))
        if (match) handleSelect(match)
        else showNotification(`I heard: "${transcript}". Try saying an option clearly.`, 'info')
      },
      (interim) => setInterimText(interim),
      () => { setListening(false); setInterimText('') },
      lang
    )
  }

  // ── Finish screen ──
  if (finished) {
    const acc = getAccuracy(adaptive)
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="glass-card animate-scaleIn" style={{ maxWidth: 480, width: '100%', padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{acc >= 80 ? '🎉' : acc >= 50 ? '👍' : '💪'}</div>
          <h2 className="gradient-text" style={{ marginBottom: 8 }}>{txt.quiz_well_done}</h2>
          <p style={{ marginBottom: 28 }}>
            {acc >= 80 ? 'Outstanding work!' : acc >= 50 ? 'Great effort!' : 'Keep practicing — you\'re getting better!'}
          </p>

          <div className="grid-2" style={{ gap: 12, marginBottom: 28 }}>
            {[
              { label: txt.quiz_accuracy,      value: `${acc}%`,        icon: '🎯' },
              { label: txt.quiz_points_earned,  value: `+${totalPoints}`, icon: '⭐' },
              { label: 'Answered',              value: `${adaptive.totalAnswered}`,  icon: '📝' },
              { label: txt.quiz_difficulty,     value: adaptive.difficulty, icon: '📊' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#f1f5f9' }}>{s.value}</span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(241,245,249,0.5)' }}>{s.label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/subjects')}>
              {txt.quiz_back_dash}
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setFinished(false); setQIndex(0); setSelected(null); setAnswered(false); setTotalPoints(0); setAdaptive(getInitialState(subject)) }}>
              {txt.quiz_play_again}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{ width: 48, height: 48, border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', margin: '0 auto 16px' }} />
          <p>Loading questions...</p>
        </div>
      </div>
    )
  }

  const diffColor = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' }
  const progress  = ((qIndex) / questions.length) * 100

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => { stopSpeaking(); navigate('/subjects') }}>
          {txt.quiz_back_dash}
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge" style={{ background: `${diffColor[adaptive.difficulty]}22`, color: diffColor[adaptive.difficulty], border: `1px solid ${diffColor[adaptive.difficulty]}44` }}>
            {adaptive.difficulty.toUpperCase()}
          </span>
          <span className="badge badge-indigo">
            {txt.quiz_question} {qIndex + 1} {txt.quiz_of} {questions.length}
          </span>
          <span className="badge badge-amber">
            ⭐ {totalPoints} pts
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-track" style={{ marginBottom: 28, height: 6 }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question card */}
      <div className="glass-card animate-fadeInUp" style={{ padding: '32px 28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg,#6366f1,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
          }}>❓</div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(241,245,249,0.4)', marginBottom: 4, margin: '0 0 4px' }}>
              {txt.quiz_question} {qIndex + 1}
            </p>
            <h2 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', color: '#f1f5f9', lineHeight: 1.45, margin: 0 }}>
              {current.question}
            </h2>
          </div>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {current.options?.map((opt, i) => {
            let cls = 'quiz-option'
            if (answered) {
              if (opt === current.answer) cls += ' correct'
              else if (opt === selected) cls += ' wrong'
            } else if (opt === selected) {
              cls += ' selected'
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleSelect(opt)}
                disabled={answered}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  fontSize: '0.8rem', fontWeight: 700, marginRight: 10, flexShrink: 0
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        {answered && (
          <div className="animate-fadeInUp" style={{
            marginTop: 20, padding: '14px 18px', borderRadius: 14,
            background: selected === current.answer ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)',
            border: `1px solid ${selected === current.answer ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            <p style={{ margin: 0, fontWeight: 600, color: selected === current.answer ? '#34d399' : '#f87171' }}>
              {selected === current.answer ? '✅ Correct! Great job!' : `❌ The answer is: ${current.answer}`}
            </p>
            {current.explanation && (
              <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'rgba(241,245,249,0.6)' }}>
                💡 {current.explanation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Voice & TTS controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary btn-sm" onClick={handleSpeak}>
          {txt.quiz_listen}
        </button>
        <button
          className={`btn btn-sm ${listening ? 'btn-danger' : 'btn-secondary'}`}
          onClick={handleVoiceAnswer}
          disabled={answered}
        >
          {listening ? txt.quiz_listening : txt.quiz_voice_answer}
        </button>
        {interimText && (
          <span style={{ alignSelf: 'center', fontSize: '0.8rem', color: 'rgba(241,245,249,0.5)', fontStyle: 'italic' }}>
            "{interimText}"
          </span>
        )}
      </div>

      {/* Next button */}
      {answered && (
        <button className="btn btn-primary animate-fadeInUp" style={{ width: '100%', padding: 14 }} onClick={handleNext}>
          {qIndex + 1 >= questions.length ? txt.quiz_finish : txt.quiz_next}
        </button>
      )}
    </div>
  )
}
