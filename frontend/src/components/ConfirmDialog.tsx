import { AlertTriangle } from 'lucide-react'
import { Modal, Button } from './ui'

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'ยืนยันการลบ',
  message,
  confirmLabel = 'ลบ',
  busy = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmLabel?: string
  busy?: boolean
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex gap-3.5">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-bad-soft text-bad">
          <AlertTriangle size={22} />
        </div>
        <p className="pt-1.5 text-sm text-muted">{message}</p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>ยกเลิก</Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'กำลังลบ...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
