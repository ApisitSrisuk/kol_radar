import { Download, ImageOff } from 'lucide-react'

export function CompCard({
  value,
  name,
  emptyText = 'ยังไม่มี comp card',
}: {
  value?: string
  name: string
  emptyText?: string
}) {
  if (!value) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl2 border border-dashed border-line-strong bg-surface-2 py-10 text-faint">
        <ImageOff size={24} />
        <span className="text-[13px]">{emptyText}</span>
      </div>
    )
  }
  const safe = name.replace(/[^\w฀-๿.-]+/g, '_')
  return (
    <div className="overflow-hidden rounded-xl2 border border-line bg-surface-2">
      <img src={value} alt={`comp card ${name}`} className="max-h-[420px] w-full object-contain" />
      <div className="flex justify-end border-t border-line p-2.5">
        <a
          href={value}
          download={`${safe}-compcard.jpg`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-fg transition hover:border-line-strong"
        >
          <Download size={14} />
          ดาวน์โหลด
        </a>
      </div>
    </div>
  )
}
