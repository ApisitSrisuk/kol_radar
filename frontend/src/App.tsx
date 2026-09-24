import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { DataProvider } from './hooks/DataContext'
import { ToastProvider } from './hooks/Toast'
import { ThemeProvider } from './hooks/ThemeContext'
import { LOCAL_MODE } from './lib/repo'
import { supabase } from './lib/supabase'
import { Layout } from './components/Layout'
import { PortalLayout } from './components/PortalLayout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Kols } from './pages/Kols'
import { KolProfile } from './pages/KolProfile'
import { Campaigns } from './pages/Campaigns'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'
import { Integrations } from './pages/Integrations'
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
          <Route path="integrations" element={<Integrations />} />
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
  const { user, loading, role, signOut } = useAuth()
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

  // โหมด Supabase: ล็อกอินด้วย auth จริง
  if (loading || (user && role === null))
    return <div className="grid min-h-dvh place-items-center text-faint">กำลังโหลด...</div>
  if (!user) return <Login />
  if (role === 'kol') return <KolPortalGate userId={user.id} onExit={signOut} />
  return <TeamShell />
}

/** โหมด Supabase: หา KOL ที่ผูกกับบัญชีนี้ แล้วเข้า Portal */
function KolPortalGate({ userId, onExit }: { userId: string; onExit: () => void }) {
  const [kolId, setKolId] = useState<string | null | undefined>(undefined)
  useEffect(() => {
    let alive = true
    supabase
      .from('kols')
      .select('id')
      .eq('account_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (alive) setKolId(data?.id ?? null)
      })
    return () => {
      alive = false
    }
  }, [userId])

  if (kolId === undefined)
    return <div className="grid min-h-dvh place-items-center text-faint">กำลังโหลด...</div>
  if (!kolId)
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <div className="text-[15px] font-semibold">บัญชีนี้ยังไม่ได้ผูกกับ KOL</div>
          <p className="mt-1 text-[13px] text-muted">ติดต่อทีมงานให้ผูกบัญชี หรือออกจากระบบ</p>
          <button onClick={onExit} className="mt-4 rounded-[10px] border border-line px-4 py-2 text-[13px] font-semibold hover:text-accent">
            ออกจากระบบ
          </button>
        </div>
      </div>
    )
  return <PortalShell kolId={kolId} onExit={onExit} />
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
