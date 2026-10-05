import React, { useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { getHistory } from '../services/storage.js'
import { getLearnText } from '../data/learnText.js'

const SUBJECTS = [
  { id: 'english', label: 'English', icon: '📖', color: '#f59e0b', glow: 'rgba(245,158,11,0.35)', desc: 'Reading, vocabulary, spelling, and comprehension' },
  { id: 'math',    label: 'Mathematics', icon: '🔢', color: '#6366f1', glow: 'rgba(99,102,241,0.35)', desc: 'Number skills, word problems, and operations' },
  { id: 'science', label: 'Science',     icon: '🔬', color: '#10b981', glow: 'rgba(16,185,129,0.35)', desc: 'Concept learning, diagrams, and experiments' },
  { id: 'social_studies', label: 'Social Studies', icon: '🗺️', color: '#ec4899', glow: 'rgba(236,72,153,0.35)', desc: 'Stories, facts, maps, and sequencing' },
  { id: 'memory', label: 'Memory & Focus', icon: '🧠', color: '#8b5cf6', glow: 'rgba(139,92,246,0.35)', desc: 'Recall games, attention tasks, and revision' },
]

const ALL_AVAILABLE_BADGES = [
  { name: 'First Step', icon: '🌱', desc: 'Completed your first quiz question' },
  { name: 'Perfect Score', icon: '🎯', desc: 'Scored 100% on any subject quiz' },
  { name: 'High Scorer', icon: '🏆', desc: 'Accumulated 100+ points in a single session' },
  { name: 'math Expert', icon: '🔢', desc: 'Mastered Hard difficulty math questions' },
  { name: 'english Expert', icon: '📖', desc: 'Mastered Hard difficulty English vocabulary' },
  { name: 'science Expert', icon: '🔬', desc: 'Mastered Hard difficulty Science questions' },
  { name: 'Speed Champion', icon: '⚡', desc: 'Scored 40+ points in Math Speed Run' },
  { name: 'Memory Master', icon: '🃏', desc: 'Completed Word Match in under 12 moves' },
]

const QUICK_ACTIONS = [
  { label: 'Ask AI Tutor', icon: '🤖', to: '/chatbot',   color: '#6366f1' },
  { label: 'Play Games',   icon: '🎮', to: '/games',     color: '#a855f7' },
  { label: 'Writing Help', icon: '✏️', to: '/writing',   color: '#10b981' },
  { label: 'Parent View',  icon: '👨‍👩‍👧', to: '/parent',    color: '#f59e0b' },
]

function StatCard({ icon, label, value, color, delay, subtext }) {
  return (
    <div className={`stat-card animate-fadeInUp delay-${delay}`} style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="stat-icon" style={{ background: `${color}22`, border: `1px solid ${color}40` }}>
        <span>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(241,245,249,0.7)', marginTop: 4 }}>{label}</div>
        {subtext && <div style={{ fontSize: '0.7rem', color: color, marginTop: 2, fontWeight: 600 }}>{subtext}</div>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { currentProfile, settings } = useApp()
  const navigate = useNavigate()
  const txt = getLearnText(settings?.language)

  const xpToNextLevel  = (currentProfile?.level || 1) * 200
  const currentXP      = (currentProfile?.points || 0) % 200
  const progressPct    = Math.min((currentXP / xpToNextLevel) * 100, 100).toFixed(1)

  const timeOfDay = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return { greet: txt.dash_greeting_morning, emoji: '☀️' }
    if (h < 17) return { greet: txt.dash_greeting_afternoon, emoji: '🌤️' }
    return { greet: txt.dash_greeting_evening, emoji: '🌙' }
  }, [txt])

  // Load actual persistent session history for this student
  const history = useMemo(() => {
    return currentProfile ? getHistory(currentProfile.id) : []
  }, [currentProfile])

  // Calculate subject progress and accuracy from actual saved history
  const subjectStats = useMemo(() => {
    const stats = {}
    SUBJECTS.forEach(s => {
      const subjectHistory = history.filter(h => h.subject === s.id)
      const count = subjectHistory.length
      const correct = subjectHistory.filter(h => h.correct).length
      const accuracy = count > 0 ? Math.round((correct / count) * 100) : 0
      // 10 answers benchmarks a mastery level
      const progress = Math.min(Math.round((count / 10) * 100), 100)
      stats[s.id] = { count, correct, accuracy, progress }
    })
    return stats
  }, [history])

  // Smart Personalized Recommendation
  const recommendation = useMemo(() => {
    // Check if any subject has lowest attempts or accuracy
    let recSubject = SUBJECTS[0]
    let lowestAttempts = Infinity
    SUBJECTS.forEach(s => {
      const stat = subjectStats[s.id] || { count: 0 }
      if (stat.count < lowestAttempts) {
        lowestAttempts = stat.count
        recSubject = s
      }
    })

    if (lowestAttempts === 0) {
      return {
        title: `${txt.dash_explore_subject} ${recSubject.label} ${txt.dash_today}`,
        desc: `${txt.dash_not_practiced} ${recSubject.label} ${txt.dash_yet}`,
        subjectId: recSubject.id,
        icon: recSubject.icon,
        color: recSubject.color,
        cta: `${txt.dash_start} ${recSubject.label} ${txt.dash_quiz}`,
      }
    }

    return {
      title: `${txt.dash_keep_streak} ${recSubject.label} ${txt.dash_streak_msg}`,
      desc: `${txt.dash_not_practiced} ${recSubject.label}.`,
      subjectId: recSubject.id,
      icon: recSubject.icon,
      color: recSubject.color,
      cta: `${txt.dash_practice} ${recSubject.label} →`,
    }
  }, [subjectStats])

  return (
    <div className="page-container">

      {/* ── Greeting & Level Overview ── */}
      <div className="animate-fadeInUp" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 38 }}>{timeOfDay.emoji}</span>
            <div>
                          <p style={{ fontSize: '0.9rem', color: 'rgba(241,245,249,0.7)', margin: 0 }}>{timeOfDay.greet}</p>
              <h1 style={{ fontSize: '2.2rem', margin: 0 }}>
                {currentProfile?.name || 'Explorer'}! <span className="gradient-text">{txt.dash_ready}</span>
              </h1>
            </div>
          </div>

          {/* Quick link back to landing page website */}
                    <Link
            to="/"
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {txt.dash_back}
          </Link>
        </div>

        {/* Level & XP Progress Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1.5px solid rgba(99,102,241,0.25)',
          borderRadius: 20, padding: '18px 22px',
          marginTop: 20, display: 'flex', alignItems: 'center', gap: 18,
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          flexWrap: 'wrap',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(135deg,#6366f1,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, boxShadow: '0 0 20px rgba(99,102,241,0.5)'
          }}>⚡</div>
          <div style={{ flex: '1 1 240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f1f5f9' }}>
                {txt.dash_level} {currentProfile?.level || 1} {txt.dash_explorer}
              </span>
              <span style={{ fontSize: '0.84rem', color: 'var(--indigo-lt)', fontWeight: 600 }}>
                {currentXP} / {xpToNextLevel} XP ({progressPct}%)
              </span>
            </div>
            <div className="progress-track" style={{ height: 10 }}>
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '0.74rem', color: 'rgba(241,245,249,0.5)' }}>{txt.dash_next_goal}</div>
            <div style={{ fontWeight: 800, color: '#818cf8', fontSize: '1rem' }}>{xpToNextLevel - currentXP} {txt.dash_xp_needed}</div>
          </div>
        </div>
      </div>

      {/* ── Key Progress Indicators & Statistics ── */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard icon="⭐" label={txt.dash_total_points}  value={currentProfile?.points || 0} color="#f59e0b" delay={1} subtext={txt.dash_keep_earning} />
        <StatCard icon="📈" label={txt.dash_current_level} value={`${txt.dash_level} ${currentProfile?.level || 1}`} color="#6366f1" delay={2} subtext={txt.dash_adaptive_rank} />
        <StatCard icon="🔥" label={txt.dash_streak} value={`${currentProfile?.streak || 0} ${txt.dash_days}`} color="#ef4444" delay={3} subtext={txt.dash_daily_habit} />
        <StatCard icon="🏅" label={txt.dash_badges} value={`${currentProfile?.badges?.length || 0} / ${ALL_AVAILABLE_BADGES.length}`} color="#a855f7" delay={4} subtext={txt.dash_achievements} />
      </div>

      {/* ── Personalized Daily Recommendations ── */}
      <div style={{ marginBottom: 36 }}>
        <div
          className="glass-card animate-fadeInUp"
          style={{
            padding: '24px 28px',
            borderRadius: 22,
            border: `1.5px solid ${recommendation.color}40`,
            background: `radial-gradient(ellipse at top left, ${recommendation.color}15 0%, rgba(255,255,255,0.03) 70%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: '1 1 300px' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                background: `${recommendation.color}25`,
                border: `1.5px solid ${recommendation.color}50`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                flexShrink: 0,
              }}
            >
              {recommendation.icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>{txt.dash_recommended}</span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(241,245,249,0.5)' }}>{txt.dash_adaptive}</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', margin: '0 0 4px', color: '#f8fafc' }}>{recommendation.title}</h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(241,245,249,0.75)' }}>{recommendation.desc}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/quiz/${recommendation.subjectId}`)}
              className="btn btn-primary"
              style={{
                background: `linear-gradient(135deg, ${recommendation.color}, ${recommendation.color}cc)`,
                fontWeight: 700,
                padding: '12px 22px',
              }}
            >
              {recommendation.cta}
            </button>
            <button
              onClick={() => navigate('/games')}
              className="btn btn-secondary"
              style={{ fontWeight: 600, padding: '12px 20px' }}
            >
              {txt.dash_game_break}
            </button>
          </div>
        </div>
      </div>

      {/* ── Choose a Subject (With Subject Progress Indicators) ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ margin: 0 }}>{txt.dash_subjects_title}</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.86rem' }}>{txt.dash_subjects_sub}</p>
          </div>
          <button
            onClick={() => navigate('/subjects')}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600 }}
          >
            {txt.dash_view_all}
          </button>
        </div>

        <div className="grid-3" style={{ gap: 20 }}>
          {SUBJECTS.map((s, i) => {
            const stat = subjectStats[s.id] || { count: 0, correct: 0, accuracy: 0, progress: 0 }
            return (
              <div
                key={s.id}
                className={`subject-card animate-fadeInUp delay-${i + 1}`}
                style={{
                  background: `radial-gradient(ellipse at top left, ${s.color}15 0%, rgba(255,255,255,0.03) 70%)`,
                  borderColor: `${s.color}35`,
                  textAlign: 'left',
                  width: '100%',
                  color: '#f1f5f9',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 22,
                  padding: '24px 22px',
                }}
                onClick={() => navigate(`/quiz/${s.id}`)}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 10px 40px ${s.glow}` }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ fontSize: 40 }}>{s.icon}</div>
                    <span
                      className="badge"
                      style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40`, fontSize: '0.74rem' }}
                    >
                      {stat.count > 0 ? `${stat.accuracy}${txt.dash_accuracy}` : txt.dash_ready_to_start}
                    </span>
                  </div>

                  <h3 style={{ color: '#f1f5f9', marginBottom: 6, fontSize: '1.25rem' }}>{s.label}</h3>
                  <p style={{ fontSize: '0.84rem', margin: '0 0 16px', lineHeight: 1.5, color: 'rgba(241,245,249,0.7)' }}>
                    {s.desc}
                  </p>
                </div>

                {/* Subject Progress Indicator */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'rgba(241,245,249,0.55)', marginBottom: 6 }}>
                    <span>{txt.dash_practice_progress}</span>
                    <span style={{ fontWeight: 600, color: s.color }}>{stat.count} {txt.dash_questions_logged}</span>
                  </div>
                  <div className="progress-track" style={{ height: 6, marginBottom: 16 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.max(stat.progress, 5)}%`,
                        background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)`,
                      }}
                    />
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: s.color, background: `${s.color}18`, padding: '6px 14px', borderRadius: 999, border: `1px solid ${s.color}30` }}>
                    {txt.dash_start_quiz_btn}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ marginBottom: 16 }}>{txt.dash_quick_tools}</h2>
        <div className="grid-4" style={{ gap: 16 }}>
          {QUICK_ACTIONS.map((a, i) => (
            <button
              key={a.to}
              className={`glass-card animate-fadeInUp delay-${i + 1}`}
              style={{
                padding: '22px 20px', cursor: 'pointer', textAlign: 'center',
                color: '#f1f5f9', fontFamily: 'inherit', border: 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                borderRadius: 20,
              }}
              onClick={() => navigate(a.to)}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: `${a.color}22`,
                border: `1px solid ${a.color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26
              }}>{a.icon}</div>
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Recent Activity Timeline (Requirement 9) ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ margin: 0 }}>{txt.dash_recent}</h2>
          <button
            onClick={() => navigate('/parent')}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600 }}
          >
            {txt.dash_parent_report}
          </button>
        </div>

        <div className="glass-card" style={{ padding: '22px 24px', borderRadius: 20 }}>
          {history.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {history.slice(0, 5).map((entry, idx) => {
                const sub = SUBJECTS.find(s => s.id === entry.subject) || { icon: '📝', label: entry.subject || 'Quiz', color: '#6366f1' }
                const formattedDate = entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      gap: 14,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: `${sub.color}22`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      >
                        {sub.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                          {entry.question ? (entry.question.length > 60 ? entry.question.slice(0, 60) + '...' : entry.question) : `${sub.label} Practice`}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'rgba(241,245,249,0.5)', marginTop: 2 }}>
                          {sub.label} · Difficulty: {entry.difficulty || 'Normal'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span
                        className="badge"
                        style={{
                          background: entry.correct ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                          color: entry.correct ? '#34d399' : '#fbbf24',
                          border: `1px solid ${entry.correct ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}`,
                          fontSize: '0.76rem',
                        }}
                      >
                        {entry.correct ? '✅ Correct (+10 XP)' : '💡 Practiced'}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'rgba(241,245,249,0.45)' }}>
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '28px 16px' }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>🌟</div>
              <h4 style={{ margin: '0 0 6px', color: '#f8fafc' }}>{txt.dash_no_activity}</h4>
              <p style={{ margin: '0 0 18px', fontSize: '0.86rem', color: 'rgba(241,245,249,0.6)' }}>
                {txt.dash_no_activity_sub}
              </p>
              <button
                onClick={() => navigate('/quiz/math')}
                className="btn btn-primary btn-sm"
                style={{ fontWeight: 700 }}
              >
                {txt.dash_try_quiz}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Badges Gallery (Earned + Unlockable) ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>{txt.dash_badges_title}</h2>
          <span style={{ fontSize: '0.84rem', color: 'rgba(241,245,249,0.6)' }}>
            {txt.dash_unlocked}: {currentProfile?.badges?.length || 0} / {ALL_AVAILABLE_BADGES.length}
          </span>
        </div>

        <div className="grid-4" style={{ gap: 14 }}>
          {ALL_AVAILABLE_BADGES.map((b) => {
            const isUnlocked = currentProfile?.badges?.includes(b.name)
            return (
              <div
                key={b.name}
                className="glass-card"
                style={{
                  padding: '16px 18px',
                  borderRadius: 18,
                  border: isUnlocked ? '1.5px solid rgba(168,85,247,0.4)' : '1px dashed rgba(255,255,255,0.1)',
                  background: isUnlocked ? 'radial-gradient(ellipse at top left, rgba(168,85,247,0.15) 0%, rgba(255,255,255,0.03) 70%)' : 'rgba(255,255,255,0.02)',
                  opacity: isUnlocked ? 1 : 0.65,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    filter: isUnlocked ? 'none' : 'grayscale(1)',
                    flexShrink: 0,
                  }}
                >
                  {b.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isUnlocked ? '#f8fafc' : 'rgba(241,245,249,0.7)' }}>
                    {b.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(241,245,249,0.5)', marginTop: 2 }}>
                    {b.desc}
                  </div>
                    <span className="badge" style={{ padding: '2px 8px', fontSize: '0.65rem', background: isUnlocked ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.06)', color: isUnlocked ? '#c084fc' : 'rgba(241,245,249,0.4)', border: 'none' }}>
                      {isUnlocked ? txt.dash_unlocked : txt.dash_locked}
                    </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
