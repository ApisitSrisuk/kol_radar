import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { fetchMessages, sendMessage, onChatChange, type ChatMessage, type Sender } from '../../lib/chat'
import { Avatar } from '../common'

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

export function ChatThread({
  kolId,
  viewer,
  peerName,
  peerSeed,
}: {
  kolId: string
  viewer: Sender
  peerName: string
  peerSeed?: string
}) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    const load = () => fetchMessages(kolId).then((m) => alive && setMsgs(m))
    load().finally(() => alive && setLoading(false))
    const off = onChatChange(load)
    return () => {
      alive = false
      off()
    }
  }, [kolId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const t = text.trim()
    if (!t) return
    setText('')
    const m = await sendMessage(kolId, viewer, t)
    setMsgs((prev) => [...prev, m])
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
        {loading ? (
          <div className="py-10 text-center text-[13px] text-faint">กำลังโหลด...</div>
        ) : msgs.length === 0 ? (
          <div className="grid h-full place-items-center text-center text-[13px] text-faint">
            เริ่มการสนทนากับ {peerName} ได้เลย
          </div>
        ) : (
          msgs.map((m) => {
            const mine = m.sender === viewer
            return (
              <div key={m.id} className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                {!mine && <Avatar name={peerName} seed={peerSeed ?? peerName} size={28} />}
                <div className={`max-w-[75%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-[13.5px] leading-snug ${
                      mine
                        ? 'rounded-br-sm bg-accent text-white'
                        : 'rounded-bl-sm bg-surface-2 text-fg'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="mt-0.5 px-1 text-[10.5px] text-faint">{fmtTime(m.created_at)}</span>
                </div>
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`พิมพ์ข้อความถึง ${peerName}...`}
          className="flex-1 rounded-full border border-line bg-bg px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-white transition hover:brightness-105 disabled:opacity-40"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  )
}
