import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

export interface TabItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

/** แถบแท็บด้านล่าง — แสดงเฉพาะจอมือถือ (ซ่อนบน md ขึ้นไป) */
export function BottomTabs({ items }: { items: TabItem[] }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid border-t border-line bg-surface md:hidden"
      style={{
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition ${
              isActive ? 'text-accent' : 'text-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <it.icon size={21} strokeWidth={isActive ? 2.3 : 1.9} />
              {it.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
