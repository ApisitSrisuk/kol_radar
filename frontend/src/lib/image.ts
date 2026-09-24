/**
 * อ่านไฟล์รูปภาพ → ย่อขนาด → คืนค่าเป็น data URL (JPEG)
 * ย่อเพื่อไม่ให้ localStorage เต็ม (โหมด Local) และให้โหลดเร็ว
 */
export async function fileToDataUrl(
  file: File,
  maxDim = 1000,
  quality = 0.82
): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(new Error('อ่านไฟล์ไม่สำเร็จ'))
    r.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = () => reject(new Error('ไฟล์รูปไม่ถูกต้อง'))
    i.src = raw
  })

  const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return raw
  // พื้นหลังขาว (กันรูปโปร่งใสกลายเป็นดำตอนแปลงเป็น JPEG)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', quality)
}
