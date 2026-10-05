// Global App Context — manages profile, settings, language, and gamification state
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getProfiles, saveProfile, getProgress, saveProgress } from '../services/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [profiles, setProfiles]       = useState([])
  const [currentProfile, setCurrentProfile] = useState(null)
  const [settings, setSettings]       = useState({ language: 'en', dyslexicFont: false, highContrast: false, ttsEnabled: true, speechRate: 0.85, theme: 'dark', reducedMotion: false })
  const [notification, setNotification] = useState(null)
  const [bloomMode, setBloomMode] = useState('hero')
  const [bloomBurst, setBloomBurst] = useState(0)

  const triggerBloomBurst = useCallback(() => {
    setBloomBurst(prev => prev + 1)
  }, [])

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type, id: Date.now() })
    setTimeout(() => setNotification(null), 3500)
  }, [])

  // Load profiles from localStorage on mount
  useEffect(() => {
    const stored = getProfiles()
    setProfiles(stored)
    const lastId = localStorage.getItem('neurolex_last_profile')
    if (lastId) {
      const found = stored.find(p => p.id === lastId)
      if (found) setCurrentProfile(found)
    }
  }, [])

  const login = useCallback((profile) => {
    setCurrentProfile(profile)
    localStorage.setItem('neurolex_last_profile', profile.id)
  }, [])

  const logout = useCallback(() => {
    setCurrentProfile(null)
    localStorage.removeItem('neurolex_last_profile')
  }, [])

  const createProfile = useCallback((name, avatar) => {
    const profile = {
      id: `profile_${Date.now()}`,
      name,
      avatar,
      language: settings.language,
      points: 0,
      level: 1,
      badges: [],
      streak: 0,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    const updated = [...profiles, profile]
    setProfiles(updated)
    saveProfile(updated)
    login(profile)
    return profile
  }, [profiles, settings.language, login])

  const updateProfile = useCallback((updates) => {
    if (!currentProfile) return
    const updated = { ...currentProfile, ...updates, lastActive: new Date().toISOString() }
    setCurrentProfile(updated)
    const updatedList = profiles.map(p => p.id === updated.id ? updated : p)
    setProfiles(updatedList)
    saveProfile(updatedList)
  }, [currentProfile, profiles])

  const deleteProfile = useCallback((profileId) => {
    const updatedList = profiles.filter(p => p.id !== profileId)
    setProfiles(updatedList)
    saveProfile(updatedList)
    if (currentProfile?.id === profileId) {
      logout()
    }
  }, [profiles, currentProfile, logout])

  const addPoints = useCallback((pts) => {
    if (!currentProfile) return
    const newPoints = (currentProfile.points || 0) + pts
    const newLevel = Math.floor(newPoints / 200) + 1
    const leveledUp = newLevel > (currentProfile.level || 1)
    updateProfile({ points: newPoints, level: newLevel })
    
    // Trigger burst on level up or large points
    if (leveledUp || pts >= 10) triggerBloomBurst()
    
    if (leveledUp) showNotification(`🎉 Level Up! You're now Level ${newLevel}!`, 'success')
    return { newPoints, leveledUp, newLevel }
  }, [currentProfile, updateProfile, triggerBloomBurst, showNotification])

  const awardBadge = useCallback((badge) => {
    if (!currentProfile) return
    if (currentProfile.badges?.includes(badge)) return
    const badges = [...(currentProfile.badges || []), badge]
    updateProfile({ badges })
    triggerBloomBurst()
    showNotification(`🏅 Badge Unlocked: ${badge}!`, 'badge')
  }, [currentProfile, updateProfile, triggerBloomBurst, showNotification])


  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => {
      const merged = { ...prev, ...newSettings }
      localStorage.setItem('neurolex_settings', JSON.stringify(merged))
      return merged
    })
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('neurolex_settings')
    if (stored) {
      try {
        setSettings(prev => ({ ...prev, ...JSON.parse(stored) }))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Sync theme and reduced motion to html/body
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.add('theme-light')
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.classList.remove('theme-light')
      document.documentElement.setAttribute('data-theme', 'dark')
    }
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion')
    } else {
      document.documentElement.classList.remove('reduced-motion')
    }
  }, [settings.theme, settings.reducedMotion])

  const value = {
    profiles, currentProfile, settings,
    login, logout, createProfile, updateProfile, deleteProfile,
    addPoints, awardBadge, notification, showNotification, updateSettings,
    bloomMode, setBloomMode, bloomBurst, triggerBloomBurst
  }

  return (
    <AppContext.Provider value={value}>
      <div className={`app-root ${settings.dyslexicFont ? 'font-dyslexic' : ''} ${settings.highContrast ? 'contrast-150' : ''} ${settings.reducedMotion ? 'reduced-motion' : ''} ${settings.theme === 'light' ? 'theme-light' : 'theme-dark'}`}>
        {children}
      </div>
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
