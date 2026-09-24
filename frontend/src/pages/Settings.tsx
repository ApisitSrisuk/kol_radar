import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useTheme, ACCENT_PRESETS, DEFAULT_SITE_NAME, type ThemeMode } from '../hooks/ThemeContext'
import { Card, CardHeader, Field, TextInput } from '../components/ui'
import { ImageField } from '../components/ImageField'
import { LogoBadge } from '../components/LogoBadge'

const MODES: { key: ThemeMode; label: string; desc: string; icon: typeof Sun }[] = [
  { key: 'light', label: 'สว่าง', desc: 'โทนสว่างเสมอ', icon: Sun },
  { key: 'dark', label: 'มืด', desc: 'โทนมืดเสมอ', icon: Moon },
  { key: 'system', label: 'ตามระบบ', desc: 'ตามการตั้งค่าเครื่อง', icon: Monitor },
]

export function Settings() {
  const { mode, setMode, accent, setAccent, dark, siteName, setSiteName, logo, setLogo } = useTheme()
  const isCustom = accent !== 'default' && !ACCENT_PRESETS.some((p) => p.color === accent)

  return (
    <div className="max-w-3xl space-y-4">
      {/* Brand: logo + name */}
      <Card>
        <CardHeader title="แบรนด์" hint="โลโก้และชื่อ แสดงที่แถบเมนู หน้าเข้าสู่ระบบ และแท็บเบราว์เซอร์" />
        <div className="space-y-4 p-[18px]">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <Field label="ชื่อระบบ / แบรนด์">
                <TextInput
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder={DEFAULT_SITE_NAME}
                  maxLength={40}
                />
              </Field>
            </div>
            {siteName.trim() && siteName.trim() !== DEFAULT_SITE_NAME && (
              <button
                onClick={() => setSiteName(DEFAULT_SITE_NAME)}
                className="rounded-[10px] border border-line px-3 py-2 text-[13px] font-semibold text-muted transition hover:text-fg"
              >
                คืนค่าเดิม
              </button>
            )}
          </div>

          <Field label="โลโก้ (แนะนำรูปสี่เหลี่ยมจัตุรัส)">
            <ImageField
              value={logo || undefined}
              onChange={(v) => setLogo(v)}
              label="คลิกเพื่ออัปโหลดโลโก้"
              hint="PNG/JPG · ถ้าไม่ใส่จะใช้ตัวอักษรแรกของชื่อแทน"
            />
          </Field>

          {/* Preview */}
          <div className="flex items-center gap-2.5 rounded-xl2 border border-line bg-surface-2 p-3">
            <LogoBadge size={40} radius={12} />
            <div>
              <div className="font-display text-lg font-semibold leading-tight">{siteName.trim() || DEFAULT_SITE_NAME}</div>
              <div className="text-[11.5px] text-faint">ตัวอย่างที่แสดงในแถบเมนู</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Theme mode */}
      <Card>
        <CardHeader title="ธีม" hint="เลือกโหมดการแสดงผล" />
        <div className="grid gap-3 p-[18px] sm:grid-cols-3">
          {MODES.map((m) => {
            const active = mode === m.key
            return (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`flex flex-col items-start gap-2 rounded-xl2 border-2 p-4 text-left transition ${
                  active ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-line-strong'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <m.icon size={20} className={active ? 'text-accent-ink' : 'text-muted'} />
                  {active && (
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-white">
                      <Check size={13} />
                    </span>
                  )}
                </div>
                <div>
                  <div className={`font-semibold ${active ? 'text-accent-ink' : ''}`}>{m.label}</div>
                  <div className="text-[12px] text-muted">{m.desc}</div>
                </div>
              </button>
            )
          })}
        </div>
        <div className="border-t border-line px-[18px] py-3 text-[12.5px] text-faint">
          กำลังแสดงผลโหมด: <span className="font-semibold text-fg">{dark ? 'มืด' : 'สว่าง'}</span>
          {mode === 'system' && ' (ตามระบบ)'}
        </div>
      </Card>

      {/* Accent color */}
      <Card>
        <CardHeader title="สีหลัก (Accent)" hint="เลือกชุดสีหรือกำหนดเอง" />
        <div className="p-[18px]">
          <div className="flex flex-wrap gap-3">
            {ACCENT_PRESETS.map((p) => {
              const active = accent === p.key || accent === p.color || (p.key === 'default' && accent === 'default')
              return (
                <button
                  key={p.key}
                  onClick={() => setAccent(p.key === 'default' ? 'default' : p.color)}
                  title={p.name}
                  className={`flex flex-col items-center gap-1.5 rounded-xl2 border-2 p-3 transition ${
                    active ? 'border-fg' : 'border-line hover:border-line-strong'
                  }`}
                >
                  <span
                    className="grid h-9 w-9 place-items-center rounded-full text-white"
                    style={{ background: p.color }}
                  >
                    {active && <Check size={16} />}
                  </span>
                  <span className="text-[11.5px] font-medium">{p.name}</span>
                </button>
              )
            })}

            {/* Custom color */}
            <label
              className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl2 border-2 p-3 transition ${
                isCustom ? 'border-fg' : 'border-line hover:border-line-strong'
              }`}
            >
              <span
                className="grid h-9 w-9 place-items-center rounded-full text-white"
                style={{
                  background: isCustom
                    ? accent
                    : 'conic-gradient(from 0deg,#EC4079,#F97316,#16A34A,#3B82F6,#7C5CFC,#EC4079)',
                }}
              >
                {isCustom && <Check size={16} />}
              </span>
              <span className="text-[11.5px] font-medium">กำหนดเอง</span>
              <input
                type="color"
                value={isCustom ? accent : '#EC4079'}
                onChange={(e) => setAccent(e.target.value)}
                className="sr-only"
              />
            </label>
          </div>

          {/* Preview */}
          <div className="mt-5 rounded-xl2 border border-line bg-surface-2 p-4">
            <div className="mb-2 text-[12px] font-semibold text-muted">ตัวอย่าง</div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-[10px] bg-accent px-4 py-2 text-sm font-semibold text-white">ปุ่มหลัก</button>
              <span className="rounded-full bg-accent-soft px-3 py-1 text-[12.5px] font-semibold text-accent-ink">ป้ายกำกับ</span>
              <span className="font-semibold text-accent">ข้อความสีหลัก</span>
              <span className="h-6 w-6 rounded-full" style={{ background: 'var(--accent)' }} />
            </div>
          </div>

          {accent !== 'default' && (
            <button
              onClick={() => setAccent('default')}
              className="mt-3 text-[13px] font-semibold text-muted underline-offset-2 hover:text-accent hover:underline"
            >
              รีเซ็ตกลับค่าเริ่มต้น
            </button>
          )}
        </div>
      </Card>
    </div>
  )
}
