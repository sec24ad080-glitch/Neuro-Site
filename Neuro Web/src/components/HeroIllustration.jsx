import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

const LABELS = {
  en: {
    math: '1+2=3 Math',
    phonics: 'Phonics',
    readAloud: 'Read Aloud',
    science: 'Science',
  },
  ta: {
    math: '1+2=3 கணிதம்',
    phonics: 'ஒலியியல்',
    readAloud: 'ஒலி வாசிப்பு',
    science: 'அறிவியல்',
  },
  hi: {
    math: '1+2=3 गणित',
    phonics: 'ध्वनिविज्ञान',
    readAloud: 'बोलकर पढ़ें',
    science: 'विज्ञान',
  },
}

export default function HeroIllustration() {
  const app = useApp()
  const currentLang = app?.settings?.language || 'en'
  const [selectedLang, setSelectedLang] = useState(currentLang)

  const handleLangChange = (lang) => {
    setSelectedLang(lang)
    if (app?.updateSettings) {
      app.updateSettings({ language: lang })
    }
  }

  const activeLang = selectedLang in LABELS ? selectedLang : 'en'
  const labels = LABELS[activeLang]

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 560,
        margin: '0 auto 20px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className="hero-illustration-wrap"
    >
      {/* ── 3-Language Selector Pill Bar ── */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          borderRadius: 30,
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(12px)',
          marginBottom: 12,
          zIndex: 2,
        }}
      >
        <span style={{ fontSize: 12, opacity: 0.7, padding: '0 6px' }}>🌐 Language:</span>
        <button
          type="button"
          onClick={() => handleLangChange('en')}
          style={{
            background: activeLang === 'en' ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent',
            border: 'none',
            color: activeLang === 'en' ? '#fff' : 'rgba(255, 255, 255, 0.65)',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          🇬🇧 English
        </button>
        <button
          type="button"
          onClick={() => handleLangChange('ta')}
          style={{
            background: activeLang === 'ta' ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent',
            border: 'none',
            color: activeLang === 'ta' ? '#fff' : 'rgba(255, 255, 255, 0.65)',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          🇮🇳 தமிழ்
        </button>
        <button
          type="button"
          onClick={() => handleLangChange('hi')}
          style={{
            background: activeLang === 'hi' ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent',
            border: 'none',
            color: activeLang === 'hi' ? '#fff' : 'rgba(255, 255, 255, 0.65)',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          🇮🇳 हिन्दी
        </button>
      </div>

      <svg
        viewBox="0 0 560 340"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible', filter: 'drop-shadow(0 14px 34px rgba(99,102,241,0.22))' }}
        role="img"
        aria-label="Illustration of a neurodiverse learner using NeuroLite adaptive learning tools in multiple languages"
      >
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
          <linearGradient id="tabletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1e38" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="accentTeal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="accentAmber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Halo Plate */}
        <ellipse cx="280" cy="270" rx="220" ry="50" fill="url(#bgGrad)" />

        {/* Floating Constellation Lines cleanly ending at box boundaries */}
        <g stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeDasharray="4 4">
          <path d="M 155 75 Q 215 120 260 145" />
          <path d="M 405 75 Q 345 120 300 145" />
          <path d="M 150 210 Q 210 210 240 210" />
          <path d="M 410 210 Q 350 210 320 210" />
        </g>

        {/* Floating Subject Satellite 1: Math (Top Left) */}
        <g transform="translate(18, 40)" filter="url(#softGlow)">
          <rect width="138" height="52" rx="16" fill="rgba(99,102,241,0.25)" stroke="#818cf8" strokeWidth="1.5" />
          <text x="14" y="33" fontSize="20">🔢</text>
          <text x="44" y="32" fill="#ffffff" fontSize="12" fontWeight="800" fontFamily="Inter, system-ui, sans-serif">
            {labels.math}
          </text>
        </g>

        {/* Floating Subject Satellite 2: Phonics / English (Top Right) */}
        <g transform="translate(404, 40)" filter="url(#softGlow)">
          <rect width="138" height="52" rx="16" fill="rgba(245,158,11,0.25)" stroke="#fbbf24" strokeWidth="1.5" />
          <text x="14" y="33" fontSize="20">📖</text>
          <text x="44" y="32" fill="#ffffff" fontSize="12" fontWeight="800" fontFamily="Inter, system-ui, sans-serif">
            {labels.phonics}
          </text>
        </g>

        {/* Floating Subject Satellite 3: Voice / Audio (Bottom Left) */}
        <g transform="translate(10, 185)" filter="url(#softGlow)">
          <rect width="142" height="52" rx="16" fill="rgba(16,185,129,0.25)" stroke="#34d399" strokeWidth="1.5" />
          <text x="14" y="33" fontSize="20">🔊</text>
          <text x="44" y="32" fill="#ffffff" fontSize="12" fontWeight="800" fontFamily="Inter, system-ui, sans-serif">
            {labels.readAloud}
          </text>
        </g>

        {/* Floating Subject Satellite 4: Science (Bottom Right) */}
        <g transform="translate(408, 185)" filter="url(#softGlow)">
          <rect width="138" height="52" rx="16" fill="rgba(168,85,247,0.25)" stroke="#c084fc" strokeWidth="1.5" />
          <text x="14" y="33" fontSize="20">🔬</text>
          <text x="44" y="32" fill="#ffffff" fontSize="12" fontWeight="800" fontFamily="Inter, system-ui, sans-serif">
            {labels.science}
          </text>
        </g>

        {/* Central Learner Character */}
        <g transform="translate(195, 95)">
          {/* Headphones Band */}
          <path d="M 52 50 A 34 34 0 0 1 118 50" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Headphone Ear Cushions */}
          <rect x="46" y="44" width="12" height="24" rx="6" fill="#f59e0b" />
          <rect x="112" y="44" width="12" height="24" rx="6" fill="#f59e0b" />

          {/* Child Head */}
          <circle cx="85" cy="54" r="30" fill="url(#headGrad)" />
          {/* Hair detail */}
          <path d="M 60 48 Q 85 24 110 48 Q 95 38 75 42 Z" fill="#4338ca" />
          {/* Happy calm face */}
          <path d="M 74 54 Q 78 58 82 54" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 88 54 Q 92 58 96 54" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 80 64 Q 85 70 90 64" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Torso / Hoodie */}
          <path d="M 50 110 C 50 88 120 88 120 110 L 132 170 C 132 176 126 182 118 182 L 52 182 C 44 182 38 176 38 170 Z" fill="url(#bodyGrad)" />

          {/* Child holding tablet */}
          <g transform="translate(15, 120)">
            {/* Tablet Frame */}
            <rect x="18" y="10" width="104" height="68" rx="10" fill="url(#tabletGrad)" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
            {/* Tablet Screen */}
            <rect x="23" y="15" width="94" height="58" rx="6" fill="url(#screenGrad)" />

            {/* Glowing interface elements on tablet screen */}
            <circle cx="36" cy="30" r="6" fill="url(#accentTeal)" />
            <rect x="48" y="27" width="56" height="6" rx="3" fill="#818cf8" />
            
            <circle cx="36" cy="48" r="6" fill="url(#accentAmber)" />
            <rect x="48" y="45" width="44" height="6" rx="3" fill="#34d399" />

            <circle cx="104" cy="48" r="7" fill="#ec4899" />
            <text x="101" y="52" fill="#fff" fontSize="9" fontWeight="900">★</text>
          </g>

          {/* Learner Hands holding tablet */}
          <circle cx="28" cy="154" r="8" fill="#818cf8" />
          <circle cx="142" cy="154" r="8" fill="#818cf8" />
        </g>

        {/* Small floating sparkles & adaptive badges */}
        <g transform="translate(240, 20)">
          <path d="M 12 0 L 15 8 L 24 12 L 15 15 L 12 24 L 9 15 L 0 12 L 9 8 Z" fill="#fbbf24" opacity="0.85" />
        </g>
        <g transform="translate(350, 240)">
          <path d="M 8 0 L 10 5 L 16 8 L 10 10 L 8 16 L 6 10 L 0 8 L 6 5 Z" fill="#34d399" opacity="0.75" />
        </g>
        <g transform="translate(150, 240)">
          <circle cx="6" cy="6" r="4" fill="#a855f7" opacity="0.6" />
        </g>
      </svg>
    </div>
  )
}

