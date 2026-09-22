import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  msg: string
  type: ToastType
}

const ToastContext = createContext<(msg: string, type?: ToastType) => void>(() => {})

const meta: Record<ToastType, { icon: ReactNode; color: string }> = {
  success: { icon: <CheckCircle2 size={18} />, color: 'var(--good)' },
  error: { icon: <XCircle size={18} />, color: 'var(--bad)' },
  info: { icon: <Info size={18} />, color: 'var(--cyan)' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (msg: string, type: ToastType = 'success') => {
      const id = Date.now() + Math.random()
      setItems((prev) => [...prev, { id, msg, type }])
      setTimeout(() => remove(id), 3200)
    },
    [remove]
  )

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2.5 rounded-xl2 border border-line bg-surface px-4 py-3 shadow-lift"
            style={{ animation: 'toastIn .2s ease' }}
          >
            <span style={{ color: meta[t.type].color }}>{meta[t.type].icon}</span>
            <span className="flex-1 text-[13.5px] text-fg">{t.msg}</span>
            <button
              onClick={() => remove(t.id)}
              className="grid h-6 w-6 place-items-center rounded text-faint hover:text-fg"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      @media (prefers-reduced-motion:reduce){.fixed [style*="toastIn"]{animation:none!important}}`}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
