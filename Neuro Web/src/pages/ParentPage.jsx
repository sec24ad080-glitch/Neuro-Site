import React from 'react'
import { useApp } from '../context/AppContext.jsx'
import { getHistory } from '../services/storage.js'

export default function ParentPage() {
  const { profiles, currentProfile } = useApp()

  const profile = currentProfile
  const history = profile ? getHistory(profile.id) : []
  const acc     = history.length
    ? Math.round((history.filter(h => h.correct).length / history.length) * 100)
    : 0

  const subjectBreakdown = history.reduce((acc, h) => {
    if (!acc[h.subject]) acc[h.subject] = { total: 0, correct: 0 }
    acc[h.subject].total++
    if (h.correct) acc[h.subject].correct++
    return acc
  }, {})

  const SUBJECT_ICONS = { math: '🔢', science: '🔬', english: '📖' }

  return (
    <div className="page-container">
      <div className="animate-fadeInUp" style={{ marginBottom: 28 }}>
        <h1>👨‍👩‍👧 <span className="gradient-text">Parent & Teacher View</span></h1>
        <p>Track your child's learning progress and achievements.</p>
      </div>

      {!profile ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
          <h3>No Profile Selected</h3>
          <p>Please log in with a profile to see progress.</p>
        </div>
      ) : (
        <>
          {/* Profile header */}
          <div className="glass-card animate-fadeInUp" style={{ padding: '24px 28px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'linear-gradient(135deg,#6366f1,#a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 34, flexShrink: 0, boxShadow: '0 0 24px rgba(99,102,241,0.4)'
            }}>{profile.avatar}</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0 }}>{profile.name}</h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Level', value: profile.level || 1, icon: '⚡' },
                { label: 'Points', value: profile.points || 0, icon: '⭐' },
                { label: 'Badges', value: profile.badges?.length || 0, icon: '🏅' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,0.05)', borderRadius: 14,
                  padding: '12px 18px', textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1.1rem' }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(241,245,249,0.45)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall accuracy */}
          <div className="grid-2 animate-fadeInUp delay-1" style={{ marginBottom: 20 }}>
            <div className="glass-card" style={{ padding: '20px 24px' }}>
              <h4 style={{ marginBottom: 14, color: '#f1f5f9' }}>📊 Overall Accuracy</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
                  background: `conic-gradient(#6366f1 ${acc * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#0d0d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: '#818cf8' }}>
                    {acc}%
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1rem' }}>
                    {acc >= 80 ? '🌟 Excellent!' : acc >= 60 ? '👍 Good Progress' : '💪 Needs Practice'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(241,245,249,0.5)', marginTop: 4 }}>
                    {history.length} questions answered
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px 24px' }}>
              <h4 style={{ marginBottom: 14, color: '#f1f5f9' }}>🏅 Badges Earned</h4>
              {profile.badges?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {profile.badges.map(b => (
                    <span key={b} className="badge badge-amber" style={{ fontSize: '0.8rem' }}>🏅 {b}</span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>No badges yet — keep learning!</p>
              )}
            </div>
          </div>

          {/* Subject breakdown */}
          {Object.keys(subjectBreakdown).length > 0 && (
            <div className="glass-card animate-fadeInUp delay-2" style={{ padding: '24px', marginBottom: 20 }}>
              <h4 style={{ marginBottom: 18, color: '#f1f5f9' }}>📚 Subject Performance</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.entries(subjectBreakdown).map(([sub, data]) => {
                  const pct = Math.round((data.correct / data.total) * 100)
                  return (
                    <div key={sub}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, color: '#f1f5f9' }}>
                          {SUBJECT_ICONS[sub]} {sub.charAt(0).toUpperCase() + sub.slice(1)}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'rgba(241,245,249,0.5)' }}>
                          {data.correct}/{data.total} correct ({pct}%)
                        </span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent activity */}
          {history.length > 0 && (
            <div className="glass-card animate-fadeInUp delay-3" style={{ padding: '24px' }}>
              <h4 style={{ marginBottom: 16, color: '#f1f5f9' }}>🕐 Recent Activity</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }} className="scrollbar-hide">
                {history.slice(0, 20).map((h, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <span style={{ fontSize: 18 }}>{h.correct ? '✅' : '❌'}</span>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.82rem', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {h.question}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(241,245,249,0.4)', marginTop: 2 }}>
                        {SUBJECT_ICONS[h.subject]} {h.subject} · {h.difficulty} · {new Date(h.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {history.length === 0 && (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📖</div>
              <h3>No Activity Yet</h3>
              <p>Encourage your child to try a quiz or game to see their progress here!</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
