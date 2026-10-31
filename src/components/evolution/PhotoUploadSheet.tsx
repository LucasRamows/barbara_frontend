/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { progressPhotosService } from '@/services/progress-photos/progress-photos.service'
import type { ProgressPhoto, PhotoPosition } from '@/types/evolution.types'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ImageIcon } from 'lucide-react'

const POSITION_LABELS: Record<PhotoPosition, string> = {
  FRONT: 'Frente',
  BACK: 'Costas',
  LEFT: 'Lateral E',
  RIGHT: 'Lateral D',
  OTHER: 'Outra',
}
const ALL_POSITIONS: PhotoPosition[] = ['FRONT', 'BACK', 'LEFT', 'RIGHT', 'OTHER']

interface Props {
  studentId: string
  open: boolean
  onClose: () => void
  onCreated: (p: ProgressPhoto) => void
}

export function PhotoUploadSheet({ studentId, open, onClose, onCreated }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [date, setDate] = useState(today)
  const [position, setPosition] = useState<PhotoPosition>('FRONT')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | null) => {
    setFile(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  const handleSubmit = async () => {
    if (!file) { toast.error('Selecione uma foto'); return }
    setLoading(true)
    try {
      const p = await progressPhotosService.upload(file, { studentId, date, position, notes: notes || undefined })
      toast.success('Foto enviada com sucesso')
      setFile(null)
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
      setDate(today)
      setPosition('FRONT')
      setNotes('')
      onCreated(p)
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao enviar foto')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setFile(null)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && handleClose()}>
      <SheetContent side="right" className="mobile-drawer-safe-area w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Enviar foto</SheetTitle>
          <SheetDescription>Adicione uma foto de evolução do aluno.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4 pb-6">
          {/* File picker */}
          <div>
            <Label className="mb-1.5 block">Foto *</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted transition-colors hover:bg-muted/60"
              style={{ minHeight: 160 }}
            >
              {preview ? (
                <img src={preview} alt="preview" className="max-h-60 w-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                  <ImageIcon size={32} strokeWidth={1} />
                  <p className="text-sm">Toque para selecionar</p>
                </div>
              )}
            </button>
          </div>

          {/* Date */}
          <div>
            <Label className="mb-1.5 block">Data</Label>
            <DatePicker value={date} onChange={setDate} />
          </div>

          {/* Position */}
          <div>
            <Label className="mb-1.5 block">Posição</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_POSITIONS.map(pos => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosition(pos)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    position === pos
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/60'
                  }`}
                >
                  {POSITION_LABELS[pos]}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="mb-1.5 block">Observações</Label>
            <Textarea
              rows={2}
              placeholder="Opcional"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={!file || loading}>
            {loading ? 'Enviando...' : 'Enviar foto'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
