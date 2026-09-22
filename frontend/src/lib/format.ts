export const fmt = (n: number): string => {
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + 'K'
  return String(n)
}

export const baht = (n: number): string => {
  if (n >= 1e6) return '฿' + (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return '฿' + (n / 1e3).toFixed(0) + 'K'
  return '฿' + n
}

export const initials = (name: string): string =>
  name.replace(/[@#]/g, '').trim().slice(0, 2)

/** สีประจำตัว KOL แบบคงที่จาก id/ชื่อ */
const PALETTE = [
  '#EC4079', '#0EA5B7', '#7C5CFC', '#12A46A', '#E0821A',
  '#E0483C', '#3B82F6', '#EC7B4A', '#14B8A6', '#D946A0',
]
export const colorFor = (seed: string): string => {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}
