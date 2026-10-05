/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        dyslexic: ['OpenDyslexic', 'Comic Sans MS', 'cursive'],
      },
      colors: {
        primary: { 50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',500:'#6366f1',600:'#4f46e5',700:'#4338ca',800:'#3730a3',900:'#312e81' },
        accent:  { 50:'#f0fdf4',100:'#dcfce7',200:'#bbf7d0',300:'#86efac',400:'#4ade80',500:'#22c55e',600:'#16a34a',700:'#15803d',800:'#166534',900:'#14532d' },
        warn:    { 50:'#fffbeb',100:'#fef3c7',200:'#fde68a',300:'#fcd34d',400:'#fbbf24',500:'#f59e0b' },
        danger:  { 50:'#fef2f2',100:'#fee2e2',400:'#f87171',500:'#ef4444',600:'#dc2626' },
      },
      animation: {
        'bounce-in': 'bounceIn 0.5s ease-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'pulse-slow':'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'wiggle':    'wiggle 0.5s ease-in-out',
        'float':     'float 3s ease-in-out infinite',
      },
      keyframes: {
        bounceIn: { '0%':{ opacity:'0', transform:'scale(0.3)' }, '50%':{ transform:'scale(1.05)' }, '70%':{ transform:'scale(0.9)' }, '100%':{ opacity:'1', transform:'scale(1)' } },
        slideUp:  { '0%':{ opacity:'0', transform:'translateY(20px)' }, '100%':{ opacity:'1', transform:'translateY(0)' } },
        wiggle:   { '0%,100%':{ transform:'rotate(-3deg)' }, '50%':{ transform:'rotate(3deg)' } },
        float:    { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-8px)' } },
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(99,102,241,0.15)',
        'card': '0 2px 15px rgba(0,0,0,0.08)',
        'glow': '0 0 20px rgba(99,102,241,0.4)',
      },
    },
  },
  plugins: [],
}
