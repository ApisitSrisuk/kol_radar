import { useRef, useState } from 'react'
import { Upload, Trash2, ImageIcon, Loader2 } from 'lucide-react'
import { fileToDataUrl } from '../lib/image'

export function ImageField({
  value,
  onChange,
  hint = 'PNG หรือ JPG · ระบบจะย่อขนาดให้อัตโนมัติ',
}: {
  value?: string
  onChange: (dataUrl: string | undefined) => void
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      alert('รองรับเฉพาะไฟล์รูปภาพ (PNG/JPG)')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      alert('ไฟล์ใหญ่เกินไป (จำกัด 10MB)')
      return
    }
    setBusy(true)
    try {
      onChange(await fileToDataUrl(f))
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      {value ? (
        <div className="overflow-hidden rounded-xl2 border border-line bg-surface-2">
          <img src={value} alt="comp card" className="max-h-72 w-full object-contain" />
          <div className="flex gap-2 border-t border-line p-2.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-fg transition hover:border-line-strong disabled:opacity-50"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              เปลี่ยนรูป
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-bad transition hover:bg-bad-soft"
            >
              <Trash2 size={14} />
              ลบรูป
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed border-line-strong bg-surface-2 py-8 text-muted transition hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {busy ? <Loader2 size={22} className="animate-spin" /> : <ImageIcon size={22} />}
          <span className="text-[13px] font-semibold">{busy ? 'กำลังประมวลผล...' : 'คลิกเพื่ออัปโหลดรูป comp card'}</span>
          <span className="text-[11.5px] text-faint">{hint}</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
    </div>
  )
}
