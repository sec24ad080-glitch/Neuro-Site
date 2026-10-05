# Neuro Web

Neuro Web is an offline-first AI learning platform designed for neurodiverse K-5 learners. It combines adaptive quizzes, subject-based learning, voice support, local AI tutoring, and calm gamified interactions to make studying feel approachable and engaging.

## Overview

This project helps children practice core subjects such as mathematics, English, science, and social studies through:

- adaptive quiz difficulty
- subject modules and progress tracking
- AI-powered tutoring with offline fallback
- text-to-speech and voice-based interactions
- multilingual support
- low-distraction, accessibility-friendly UI
- PWA support for offline use

## Features

### Adaptive learning
- Question difficulty changes based on learner performance.
- Rewards, streaks, and badges encourage continued practice.
- Progress is stored locally in the browser.

### AI tutor experience
- Local Ollama support for offline AI responses.
- Optional Gemini integration for cloud-based assistance.
- Fallback responses keep the app usable even when no model is connected.

### Accessibility and neurodiverse support
- calm visual design
- dyslexia-friendly font mode
- voice narration and speech input
- simplified navigation and multi-language interface

### Learning modules
- dashboard overview
- subject browsing
- quiz gameplay
- writing assistance
- games and lesson-based reinforcement

## Tech stack

- React 18
- Vite
- Tailwind CSS
- PWA support via vite-plugin-pwa
- Local browser storage for progress and settings
- Optional Ollama and Google Gemini integrations

## Project structure

```text
Neuro Web/
├── public/
│   └── manifest.json
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Getting started

1. Open a terminal in the project root.
2. Install dependencies:

```bash
cd "Neuro Web"
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

5. Preview the production build:

```bash
npm run preview
```

## Available scripts

```bash
npm run dev     # start Vite dev server
npm run build   # create production build
npm run lint    # run ESLint checks
npm run preview # preview production bundle locally
```

## Optional AI configuration

- For local AI, run Ollama and configure a compatible model.
- For cloud AI assistance, set the Gemini API key in the app settings or environment if your implementation uses it.

## Notes

This project is designed to run primarily offline, with cloud-backed AI support as an optional enhancement. Data such as quiz results and learner preferences are stored locally in the browser.

## License

This project is distributed under the repository's existing license terms.
