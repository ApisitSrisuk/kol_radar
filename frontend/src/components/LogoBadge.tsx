import { useTheme, DEFAULT_SITE_NAME } from '../hooks/ThemeContext'

/** โลโก้แบรนด์ — ใช้รูปที่อัปโหลด ถ้าไม่มีใช้ตัวอักษรแรกบนพื้นไล่สี */
export function LogoBadge({ size = 34, radius = 10 }: { size?: number; radius?: number }) {
  const { logo, siteName } = useTheme()
  const brand = siteName.trim() || DEFAULT_SITE_NAME

  if (logo) {
    return (
      <img
        src={logo}
        alt={brand}
        width={size}
        height={size}
        className="shrink-0 object-cover shadow-card"
        style={{ width: size, height: size, borderRadius: radius }}
      />
    )
  }
  return (
    <div
      className="grid shrink-0 place-items-center font-display font-bold text-white shadow-card"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        fontSize: size * 0.5,
        background: 'linear-gradient(135deg,var(--accent),#FF8A5B)',
      }}
    >
      {brand.charAt(0).toUpperCase()}
    </div>
  )
}
