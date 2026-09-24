import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Megaphone,
  BarChart3,
  Plug,
  Settings,
  Moon,
  Sun,
  Menu,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTheme, DEFAULT_SITE_NAME } from '../hooks/ThemeContext'
import { LOCAL_MODE } from '../lib/repo'
import { BottomTabs, type TabItem } from './BottomTabs'
import { LogoBadge } from './LogoBadge'

const NAV = [
  { to: '/', label: 'ภาพรวม', icon: LayoutDashboard, end: true },
  { to: '/kols', label: 'รายชื่อ KOL', icon: Users, end: false },
  { to: '/campaigns', label: 'แคมเปญ', icon: Megaphone, end: false },
  { to: '/analytics', label: 'วิเคราะห์', icon: BarChart3, end: false },
]

const TABS: TabItem[] = [
  { to: '/', label: 'ภาพรวม', icon: LayoutDashboard, end: true },
  { to: '/kols', label: 'KOL', icon: Users },
  { to: '/campaigns', label: 'แคมเปญ', icon: Megaphone },
  { to: '/analytics', label: 'วิเคราะห์', icon: BarChart3 },
]

export function Layout() {
  const { dark, toggle, siteName } = useTheme()
  const brand = siteName.trim() || DEFAULT_SITE_NAME
  const { user, signOut, isSuperAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const loc = useLocation()

  useEffect(() => setOpen(false), [loc.pathname])

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[236px_1fr]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[236px] flex-col gap-1.5 border-r border-line bg-surface p-[14px] pt-5 transition-transform md:static md:translate-x-0 ${
          open ? 'translate-x-0 shadow-lift' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 px-2 pb-4">
          <LogoBadge size={34} />
          <div>
            <b className="block font-display text-[17px] leading-tight tracking-tight">{brand}</b>
            <span className="text-[11px] text-faint">ระบบติดตาม KOL</span>
          </div>
        </div>

        <div className="px-2.5 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-faint">
          เมนูหลัก
        </div>
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-accent-soft font-semibold text-accent-ink'
                  : 'text-muted hover:bg-surface-2 hover:text-fg'
              }`
            }
          >
            <n.icon size={19} strokeWidth={1.9} />
            {n.label}
          </NavLink>
        ))}

        <div className="px-2.5 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-faint">
          อื่น ๆ
        </div>
        {isSuperAdmin && (
          <NavLink
            to="/integrations"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-accent-soft font-semibold text-accent-ink'
                  : 'text-muted hover:bg-surface-2 hover:text-fg'
              }`
            }
          >
            <Plug size={19} strokeWidth={1.9} />
            เชื่อมต่อ LINE
          </NavLink>
        )}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-accent-soft font-semibold text-accent-ink'
                : 'text-muted hover:bg-surface-2 hover:text-fg'
            }`
          }
        >
          <Settings size={19} strokeWidth={1.9} />
          ตั้งค่า
        </NavLink>

        <div className="mt-auto flex items-center gap-2.5 border-t border-line pt-3.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-surface-3 font-semibold text-muted">
            {(user?.email ?? 'K')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 text-[12.5px] leading-tight">
            <b className="block">ทีมการตลาด</b>
            <div className="truncate text-[11px] text-faint">
              {LOCAL_MODE ? 'โหมด Local' : user?.email}
            </div>
          </div>
          <button
            onClick={() => {
              if (LOCAL_MODE) {
                try {
                  localStorage.removeItem('kol-session')
                } catch {
                  /* ignore */
                }
                window.location.assign('/')
              } else {
                signOut()
              }
            }}
            title="ออกจากระบบ"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-bad"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg/80 px-4 py-3 backdrop-blur md:px-6">
          <button
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-[10px] border border-line md:hidden"
          >
            <Menu size={18} />
          </button>
          <PageTitle />
          <button
            onClick={toggle}
            title="สลับธีม"
            className="ml-auto grid h-9 w-9 place-items-center rounded-[10px] border border-line text-muted transition hover:text-fg"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>
        {LOCAL_MODE && (
          <div className="border-b border-warn-soft bg-warn-soft px-4 py-1.5 text-center text-[12px] text-warn md:px-6">
            🧪 โหมด Local — ข้อมูลเก็บในเบราว์เซอร์นี้เท่านั้น · ใส่ค่า Supabase ใน{' '}
            <code>.env</code> เพื่อสลับเป็นฐานข้อมูลจริง
          </div>
        )}
        <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-6 md:px-6 md:pb-16">
          <Outlet />
        </main>
      </div>

      <BottomTabs items={TABS} />
    </div>
  )
}

const TITLES: Record<string, [string, string]> = {
  '/': ['ภาพรวม', 'สรุปผลการติดตาม KOL ทุกแพลตฟอร์ม'],
  '/kols': ['รายชื่อ KOL', 'จัดการและค้นหา KOL ในระบบ'],
  '/campaigns': ['แคมเปญ', 'ติดตามสถานะแคมเปญทั้งหมด'],
  '/analytics': ['วิเคราะห์', 'เจาะลึกข้อมูลเชิงลึกและ ROI'],
  '/settings': ['ตั้งค่า', 'ปรับแต่งธีมและสีของระบบ'],
  '/integrations': ['เชื่อมต่อ LINE', 'ตั้งค่าคีย์เพื่อรับข้อความจาก LINE'],
}
function PageTitle() {
  const loc = useLocation()
  let key = loc.pathname
  if (key.startsWith('/kols/')) key = '/kols'
  const [title, sub] = TITLES[key] ?? ['โปรไฟล์ KOL', 'รายละเอียดและผลงานรายบุคคล']
  return (
    <div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-[12.5px] text-faint">{sub}</div>
    </div>
  )
}
