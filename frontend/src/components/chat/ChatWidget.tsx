import { useEffect, useMemo, useState } from 'react'
import { MessageCircle, ChevronDown, ChevronLeft, Search } from 'lucide-react'
import { useData } from '../../hooks/DataContext'
import { Avatar } from '../common'
import { ChatThread } from './ChatThread'
import { fetchThreadsMeta, onChatChange, type ThreadMeta } from '../../lib/chat'

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

export function ChatWidget({ role, kolId }: { role: 'team' | 'kol'; kolId?: string }) {
  const { kols } = useData()
  const [open, setOpen] = useState(false)
  const [sel, setSel] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [threads, setThreads] = useState<Record<string, ThreadMeta>>({})

  useEffect(() => {
    if (!open) return
    const load = () => fetchThreadsMeta().then(setThreads)
    load()
    return onChatChange(load)
  }, [open, sel])

  const list = useMemo(() => {
    const query = q.trim().toLowerCase()
    return kols
      .filter((k) => !query || k.name.toLowerCase().includes(query) || k.handle.toLowerCase().includes(query))
      .sort((a, b) => {
        const ta = threads[a.id]?.last?.created_at
        const tb = threads[b.id]?.last?.created_at
        if (ta && tb) return ta < tb ? 1 : -1
        if (ta) return -1
        if (tb) return 1
        return a.name.localeCompare(b.name, 'th')
      })
  }, [kols, q, threads])

  const me = role === 'kol' ? kols.find((k) => k.id === kolId) : null
  const selKol = kols.find((k) => k.id === sel)
  const totalMsgs = Object.values(threads).reduce((s, t) => s + t.count, 0)

  // ---------- Launcher (หุบ) ----------
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="เปิดแชท"
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lift transition hover:brightness-105 md:bottom-5 md:right-5"
        style={{ background: 'linear-gradient(135deg,var(--accent),#FF8A5B)' }}
      >
        <MessageCircle size={24} />
        {totalMsgs > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-bad px-1 text-[10px] font-bold text-white ring-2 ring-bg">
            {totalMsgs > 99 ? '99+' : totalMsgs}
          </span>
        )}
      </button>
    )
  }

  // ---------- Panel (กาง) ----------
  const headerTitle =
    role === 'kol' ? 'ทีมงาน KOL Radar' : selKol ? selKol.name : 'ข้อความ'
  const headerSub = role === 'kol' ? 'พูดคุยกับทีมการตลาด' : selKol ? selKol.handle : `${kols.length} รายชื่อ`

  return (
    <div className="fixed bottom-20 right-4 z-50 flex h-[70vh] max-h-[520px] w-[calc(100vw-2rem)] max-w-[360px] flex-col overflow-hidden rounded-xl2 border border-line bg-surface shadow-lift md:bottom-5 md:right-5">
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-3 text-white"
        style={{ background: 'linear-gradient(135deg,var(--accent),#FF8A5B)' }}
      >
        {role === 'team' && sel && (
          <button onClick={() => setSel(null)} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/20">
            <ChevronLeft size={18} />
          </button>
        )}
        {role === 'kol' ? (
          <div className="grid h-8 w-8 place-items-center rounded-full bg-white/20 font-display font-bold">K</div>
        ) : selKol ? (
          <Avatar name={selKol.name} seed={selKol.id} size={32} />
        ) : (
          <MessageCircle size={20} />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold leading-tight">{headerTitle}</div>
          <div className="truncate text-[11px] text-white/80">{headerSub}</div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="หุบแชท" className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/20">
          <ChevronDown size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1">
        {role === 'kol' && me ? (
          <ChatThread kolId={me.id} viewer="kol" peerName="ทีมงาน" peerSeed="team-radar" />
        ) : role === 'team' && selKol ? (
          <ChatThread kolId={selKol.id} viewer="team" peerName={selKol.name} peerSeed={selKol.id} />
        ) : (
          // team: conversation list
          <div className="flex h-full flex-col">
            <div className="border-b border-line p-2.5">
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="ค้นหา KOL ที่จะทัก..."
                  className="w-full rounded-[10px] border border-line bg-bg py-2 pl-9 pr-3 text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {list.length === 0 ? (
                <div className="p-6 text-center text-[13px] text-faint">ไม่พบ KOL</div>
              ) : (
                list.map((k) => {
                  const meta = threads[k.id]
                  return (
                    <button
                      key={k.id}
                      onClick={() => setSel(k.id)}
                      className="flex w-full items-center gap-2.5 border-b border-line px-3 py-2.5 text-left transition hover:bg-surface-2"
                    >
                      <Avatar name={k.name} seed={k.id} size={36} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13.5px] font-semibold">{k.name}</span>
                          {meta?.last && <span className="shrink-0 text-[10.5px] text-faint">{fmtTime(meta.last.created_at)}</span>}
                        </div>
                        <div className="truncate text-[12px] text-muted">
                          {meta?.last ? (meta.last.sender === 'team' ? 'คุณ: ' : '') + meta.last.text : k.handle}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
