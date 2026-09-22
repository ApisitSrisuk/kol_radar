import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { DataProvider } from './hooks/DataContext'
import { ToastProvider } from './hooks/Toast'
import { LOCAL_MODE } from './lib/repo'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Kols } from './pages/Kols'
import { KolProfile } from './pages/KolProfile'
import { Campaigns } from './pages/Campaigns'
import { Analytics } from './pages/Analytics'

function AppShell() {
  return (
    <DataProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="kols" element={<Kols />} />
          <Route path="kols/:id" element={<KolProfile />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DataProvider>
  )
}

function Gate() {
  const { user, loading } = useAuth()
  const [localEntered, setLocalEntered] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kol-local-entered') === '1'
    } catch {
      return false
    }
  })

  // โหมด Local: แสดงหน้า Landing/Login (มีปุ่มเข้าใช้งาน + สมัครเป็น KOL)
  if (LOCAL_MODE) {
    if (localEntered) return <AppShell />
    return (
      <Login
        localMode
        onLocalEnter={() => {
          try {
            localStorage.setItem('kol-local-entered', '1')
          } catch {
            /* ignore */
          }
          setLocalEntered(true)
        }}
      />
    )
  }

  if (loading)
    return <div className="grid min-h-dvh place-items-center text-faint">กำลังโหลด...</div>
  if (!user) return <Login />
  return <AppShell />
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Gate />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
