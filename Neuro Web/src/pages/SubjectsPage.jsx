import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { getLearnText } from '../data/learnText.js'

const SUBJECTS = [
  { id: 'english', label: 'English', icon: '📖', color: '#f59e0b', desc: 'Reading, vocabulary, spelling, sentence building, and comprehension.', topics: ['Reading', 'Vocabulary', 'Spelling', 'Comprehension'] },
  { id: 'math', label: 'Mathematics', icon: '🔢', color: '#6366f1', desc: 'Number skills, operations, word problems, and formula practice.', topics: ['Operations', 'Word Problems', 'Formulas', 'Error Correction'] },
  { id: 'science', label: 'Science', icon: '🔬', color: '#10b981', desc: 'Concept learning, diagrams, cause-effect, and micro-experiments.',  topics: ['Concepts', 'Cause-Effect', 'Experiments', 'Recall'] },
  { id: 'social_studies', label: 'Social Studies', icon: '🗺️', color: '#ec4899', desc: 'Stories, facts, maps, sequencing, and oral recap.', topics: ['Maps', 'Stories', 'Sequencing', 'Facts'] },
  { id: 'memory', label: 'Memory & Focus', icon: '🧠', color: '#8b5cf6', desc: 'Recall games, sequence memory, spaced revision, and attention tasks.', topics: ['Recall', 'Sequence', 'Attention', 'Revision'] },
]

export default function SubjectsPage() {
  const navigate = useNavigate()
  const { settings } = useApp()
  const txt = getLearnText(settings?.language)

  const SUBJECTS = [
    { id: 'english', label: txt.sub_english_label, icon: '📖', color: '#f59e0b', desc: txt.sub_english_desc, topics: [txt.sub_english_t1, txt.sub_english_t2, txt.sub_english_t3, txt.sub_english_t4] },
    { id: 'math',   label: txt.sub_math_label,    icon: '🔢', color: '#6366f1', desc: txt.sub_math_desc,    topics: [txt.sub_math_t1, txt.sub_math_t2, txt.sub_math_t3, txt.sub_math_t4] },
    { id: 'science',label: txt.sub_science_label, icon: '🔬', color: '#10b981', desc: txt.sub_science_desc, topics: [txt.sub_science_t1, txt.sub_science_t2, txt.sub_science_t3, txt.sub_science_t4] },
    { id: 'social_studies', label: txt.sub_social_label, icon: '🗺️', color: '#ec4899', desc: txt.sub_social_desc, topics: [txt.sub_social_t1, txt.sub_social_t2, txt.sub_social_t3, txt.sub_social_t4] },
    { id: 'memory', label: txt.sub_memory_label,  icon: '🧠', color: '#8b5cf6', desc: txt.sub_memory_desc,  topics: [txt.sub_memory_t1, txt.sub_memory_t2, txt.sub_memory_t3, txt.sub_memory_t4] },
  ]

  return (
    <div className="page-container">
      <div className="animate-fadeInUp" style={{ marginBottom: 32 }}>
        <h1>{txt.sub_title}</h1>
        <p>{txt.sub_subtitle}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {SUBJECTS.map((s, i) => (
          <div
            key={s.id}
            className={`subject-card animate-fadeInUp delay-${i + 1}`}
            style={{
              background: `radial-gradient(ellipse at top left, ${s.color}15 0%, rgba(255,255,255,0.03) 70%)`,
              borderColor: `${s.color}30`,
              display: 'flex', alignItems: 'center', gap: 24,
              padding: '28px 32px',
            }}
          >
            {/* Icon */}
            <div style={{
              width: 72, height: 72, borderRadius: 22, flexShrink: 0,
              background: `${s.color}22`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, border: `1px solid ${s.color}33`
            }}>{s.icon}</div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <h2 style={{ marginBottom: 6, color: '#f1f5f9' }}>{s.label}</h2>
              <p style={{ marginBottom: 12, fontSize: '0.9rem' }}>{s.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {s.topics.map(t => (
                  <span key={t} className="badge" style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}30`, fontSize: '0.75rem' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              className="btn btn-primary"
              style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`, flexShrink: 0 }}
              onClick={() => navigate(`/quiz/${s.id}`)}
            >
              {txt.sub_start_quiz}
            </button>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div className="glass-card animate-fadeInUp" style={{ marginTop: 28, padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 32, flexShrink: 0 }}>🧠</span>
        <div>
          <h4 style={{ margin: '0 0 4px', color: '#f1f5f9' }}>{txt.sub_adaptive_title}</h4>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            {txt.sub_adaptive_desc}
          </p>
        </div>
      </div>
    </div>
  )
}
