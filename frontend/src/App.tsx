import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { DataProvider } from './hooks/DataContext'
import { ToastProvider } from './hooks/Toast'
import { ThemeProvider } from './hooks/ThemeContext'
import { LOCAL_MODE } from './lib/repo'
import { Layout } from './components/Layout'
import { PortalLayout } from './components/PortalLayout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Kols } from './pages/Kols'
import { KolProfile } from './pages/KolProfile'
import { Campaigns } from './pages/Campaigns'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'
import { PortalDashboard } from './pages/portal/PortalDashboard'
import { PortalProfile } from './pages/portal/PortalProfile'
import { PortalCampaigns } from './pages/portal/PortalCampaigns'
import { ChatWidget } from './components/chat/ChatWidget'

/** แอปฝั่งทีมการตลาด */
function TeamShell() {
  return (
    <DataProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="kols" element={<Kols />} />
          <Route path="kols/:id" element={<KolProfile />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <ChatWidget role="team" />
    </DataProvider>
  )
}

/** พื้นที่ของ KOL */
function PortalShell({ kolId, onExit }: { kolId: string; onExit: () => void }) {
  return (
    <DataProvider>
      <Routes>
        <Route element={<PortalLayout kolId={kolId} onExit={onExit} />}>
          <Route index element={<PortalDashboard />} />
          <Route path="profile" element={<PortalProfile />} />
          <Route path="campaigns" element={<PortalCampaigns />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <ChatWidget role="kol" kolId={kolId} />
    </DataProvider>
  )
}

type Session = { role: 'team' } | { role: 'kol'; kolId: string } | null

function loadSession(): Session {
  try {
    const raw = localStorage.getItem('kol-session')
    if (raw) return JSON.parse(raw) as Session
  } catch {
    /* ignore */
  }
  return null
}
function saveSession(s: Session) {
  try {
    if (s) localStorage.setItem('kol-session', JSON.stringify(s))
    else localStorage.removeItem('kol-session')
  } catch {
    /* ignore */
  }
}

function Gate() {
  const { user, loading } = useAuth()
  const [session, setSession] = useState<Session>(loadSession)

  const enter = (s: Session) => {
    saveSession(s)
    setSession(s)
  }
  const exit = () => {
    saveSession(null)
    setSession(null)
  }

  // โหมด Local: เลือกเข้าเป็นทีม หรือ KOL จากหน้า Landing
  if (LOCAL_MODE) {
    if (session?.role === 'team') return <TeamShell />
    if (session?.role === 'kol') return <PortalShell kolId={session.kolId} onExit={exit} />
    return (
      <Login
        localMode
        onEnterTeam={() => enter({ role: 'team' })}
        onEnterKol={(kolId) => enter({ role: 'kol', kolId })}
      />
    )
  }

  // โหมด Supabase: ล็อกอินทีมด้วย auth จริง
  if (loading)
    return <div className="grid min-h-dvh place-items-center text-faint">กำลังโหลด...</div>
  if (!user) return <Login />
  return <TeamShell />
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Gate />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
