import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, UserCircle, Megaphone, Moon, Sun, Menu, LogOut } from 'lucide-react'
import { useTheme, DEFAULT_SITE_NAME } from '../hooks/ThemeContext'
import { useData } from '../hooks/DataContext'
import { Avatar } from './common'
import { BottomTabs, type TabItem } from './BottomTabs'
import { LogoBadge } from './LogoBadge'

const NAV = [
  { to: '/', label: 'แดชบอร์ดของฉัน', icon: LayoutDashboard, end: true },
  { to: '/profile', label: 'โปรไฟล์ของฉัน', icon: UserCircle, end: false },
  { to: '/campaigns', label: 'แคมเปญของฉัน', icon: Megaphone, end: false },
]

const TABS: TabItem[] = [
  { to: '/', label: 'หน้าหลัก', icon: LayoutDashboard, end: true },
  { to: '/profile', label: 'โปรไฟล์', icon: UserCircle },
  { to: '/campaigns', label: 'แคมเปญ', icon: Megaphone },
]

const TITLES: Record<string, [string, string]> = {
  '/': ['แดชบอร์ดของฉัน', 'ภาพรวมผลงานและสถานะของคุณ'],
  '/profile': ['โปรไฟล์ของฉัน', 'ดูและแก้ไขข้อมูลของคุณ'],
  '/campaigns': ['แคมเปญของฉัน', 'แคมเปญที่คุณได้รับมอบหมาย'],
}

export function PortalLayout({ kolId, onExit }: { kolId: string; onExit: () => void }) {
  const { dark, toggle, siteName } = useTheme()
  const brand = siteName.trim() || DEFAULT_SITE_NAME
  const { kols } = useData()
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const me = kols.find((k) => k.id === kolId)

  useEffect(() => setOpen(false), [loc.pathname])
  const [title, sub] = TITLES[loc.pathname] ?? ['KOL Portal', '']

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[236px_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[236px] flex-col gap-1.5 border-r border-line bg-surface p-[14px] pt-5 transition-transform md:static md:translate-x-0 ${
          open ? 'translate-x-0 shadow-lift' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 px-2 pb-4">
          <LogoBadge size={34} />
          <div>
            <b className="block font-display text-[17px] leading-tight tracking-tight">{brand}</b>
            <span className="text-[11px] text-faint">พื้นที่ของ KOL</span>
          </div>
        </div>

        <div className="px-2.5 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-faint">
          เมนู
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

        <div className="mt-auto flex items-center gap-2.5 border-t border-line pt-3.5">
          {me ? <Avatar name={me.name} seed={me.id} size={34} /> : <div className="h-9 w-9 rounded-full bg-surface-3" />}
          <div className="min-w-0 flex-1 text-[12.5px] leading-tight">
            <b className="block truncate">{me?.name ?? 'KOL'}</b>
            <div className="truncate text-[11px] text-faint">{me?.handle}</div>
          </div>
          <button
            onClick={onExit}
            title="ออกจากระบบ"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-bad"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg/80 px-4 py-3 backdrop-blur md:px-6">
          <button
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-[10px] border border-line md:hidden"
          >
            <Menu size={18} />
          </button>
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <div className="text-[12.5px] text-faint">{sub}</div>
          </div>
          <button
            onClick={toggle}
            title="สลับธีม"
            className="ml-auto grid h-9 w-9 place-items-center rounded-[10px] border border-line text-muted transition hover:text-fg"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>
        <main className="mx-auto w-full max-w-[1100px] px-4 pb-24 pt-6 md:px-6 md:pb-16">
          <Outlet context={{ kolId }} />
        </main>
      </div>

      <BottomTabs items={TABS} />
    </div>
  )
}
