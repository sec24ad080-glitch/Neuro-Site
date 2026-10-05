import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext.jsx'
import Layout from './components/Layout.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'

// Lazy-load pages for performance
const LandingPage   = lazy(() => import('./pages/LandingPage.jsx'))
const LoginPage     = lazy(() => import('./pages/LoginPage.jsx'))
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))
const SubjectsPage  = lazy(() => import('./pages/SubjectsPage.jsx'))
const QuizPage      = lazy(() => import('./pages/QuizPage.jsx'))
const ChatbotPage   = lazy(() => import('./pages/ChatbotPage.jsx'))
const GamesPage     = lazy(() => import('./pages/GamesPage.jsx'))
const WritingPage   = lazy(() => import('./pages/WritingPage.jsx'))
const ParentPage    = lazy(() => import('./pages/ParentPage.jsx'))
const SettingsPage  = lazy(() => import('./pages/SettingsPage.jsx'))

function ProtectedRoute({ children }) {
  const { currentProfile } = useApp()
  if (!currentProfile) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected app routes — existing dashboard & learning features */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/subjects"  element={<SubjectsPage />} />
          <Route path="/quiz/:subject" element={<QuizPage />} />
          <Route path="/chatbot"   element={<ChatbotPage />} />
          <Route path="/games"     element={<GamesPage />} />
          <Route path="/writing"   element={<WritingPage />} />
          <Route path="/parent"    element={<ParentPage />} />
          <Route path="/settings"  element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
