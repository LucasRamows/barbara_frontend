import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { X, ChevronLeft, ChevronRight, ArrowLeftRight } from 'lucide-react'
import type { ProgressPhoto, PhotoPosition } from '@/types/evolution.types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ImageIcon } from 'lucide-react'

const POSITION_LABELS: Record<PhotoPosition, string> = {
  FRONT: 'Frente',
  BACK: 'Costas',
  LEFT: 'Lateral E',
  RIGHT: 'Lateral D',
  OTHER: 'Outra',
}

const ALL_POSITIONS: PhotoPosition[] = ['FRONT', 'BACK', 'LEFT', 'RIGHT', 'OTHER']

interface PhotoCardProps {
  photo: ProgressPhoto
  onDelete?: (id: string) => void
}

function PhotoCard({ photo, onDelete }: PhotoCardProps) {
  const [errored, setErrored] = useState(false)

  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
      {errored ? (
        <div className="flex h-full items-center justify-center">
          <ImageIcon size={32} className="text-muted-foreground/40" />
        </div>
      ) : (
        <img
          src={photo.signedUrl}
          alt={POSITION_LABELS[photo.position]}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <p className="text-[10px] text-white">{POSITION_LABELS[photo.position]}</p>
      </div>
      {onDelete && (
        <ConfirmDialog
          trigger={
            <button
              type="button"
              className="absolute right-1 top-1 hidden rounded-full bg-black/50 p-1 text-white transition-all hover:bg-black/70 group-hover:flex items-center justify-center"
            >
              <X size={12} />
            </button>
          }
          title="Remover foto"
          description="Esta foto será removida permanentemente."
          confirmLabel="Remover"
          onConfirm={() => onDelete(photo.id)}
          destructive
        />
      )}
    </div>
  )
}

interface LightboxProps {
  photos: ProgressPhoto[]
  startIndex: number
  onClose: () => void
}

function Lightbox({ photos, startIndex, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(startIndex)
  const [errored, setErrored] = useState(false)
  const photo = photos[idx]

  const prev = () => { setErrored(false); setIdx(i => Math.max(0, i - 1)) }
  const next = () => { setErrored(false); setIdx(i => Math.min(photos.length - 1, i + 1)) }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <div className="relative flex h-full w-full items-center justify-center" onClick={e => e.stopPropagation()}>
        {errored ? (
          <div className="flex flex-col items-center gap-2 text-white/60">
            <ImageIcon size={48} />
            <p className="text-sm">Imagem indisponível</p>
          </div>
        ) : (
          <img
            src={photo.signedUrl}
            alt={POSITION_LABELS[photo.position]}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onError={() => setErrored(true)}
          />
        )}
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white">
          <X size={20} />
        </button>
        {idx > 0 && (
          <button type="button" onClick={prev} className="absolute left-2 rounded-full bg-black/50 p-2 text-white">
            <ChevronLeft size={24} />
          </button>
        )}
        {idx < photos.length - 1 && (
          <button type="button" onClick={next} className="absolute right-2 rounded-full bg-black/50 p-2 text-white">
            <ChevronRight size={24} />
          </button>
        )}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-sm text-white/80">
            {format(new Date(photo.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} · {POSITION_LABELS[photo.position]}
          </p>
          <p className="mt-1 text-xs text-white/50">{idx + 1} / {photos.length}</p>
        </div>
      </div>
    </div>
  )
}

interface ComparisonViewProps {
  photos: ProgressPhoto[]
  position: PhotoPosition
  onClose: () => void
}

function ComparisonView({ photos, position, onClose }: ComparisonViewProps) {
  const byPos = photos.filter(p => p.position === position)
  const dates = [...new Set(byPos.map(p => p.date))].sort()
  const [leftDate, setLeftDate] = useState(dates[0] ?? '')
  const [rightDate, setRightDate] = useState(dates[dates.length - 1] ?? '')

  const leftPhoto = byPos.find(p => p.date === leftDate)
  const rightPhoto = byPos.find(p => p.date === rightDate)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <ArrowLeftRight size={14} />
          Comparação — {POSITION_LABELS[position]}
        </p>
        <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { date: leftDate, setDate: setLeftDate, photo: leftPhoto, label: 'Antes' },
          { date: rightDate, setDate: setRightDate, photo: rightPhoto, label: 'Depois' },
        ].map(({ date, setDate, photo, label }) => (
          <div key={label} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <select
                value={date}
                onChange={e => setDate(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none"
              >
                {dates.map(d => (
                  <option key={d} value={d}>
                    {format(new Date(d), 'dd/MM/yyyy')}
                  </option>
                ))}
              </select>
            </div>
            <div className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
              {photo ? (
                <img
                  src={photo.signedUrl}
                  alt={label}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon size={32} className="text-muted-foreground/40" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  photos: ProgressPhoto[]
  loading: boolean
  onDelete?: (id: string) => void
}

export function PhotosView({ photos, loading, onDelete }: Props) {
  const [filterPos, setFilterPos] = useState<PhotoPosition | 'ALL'>('ALL')
  const [lightboxPhotos, setLightboxPhotos] = useState<ProgressPhoto[] | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [comparePos, setComparePos] = useState<PhotoPosition | null>(null)

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
      </div>
    )
  }

  if (!photos.length) {
    return (
      <EmptyState
        icon={<ImageIcon size={48} strokeWidth={1} />}
        title="Nenhuma foto registrada"
        description="As fotos de evolução serão exibidas aqui."
      />
    )
  }

  const filtered = filterPos === 'ALL' ? photos : photos.filter(p => p.position === filterPos)

  // Group by date (descending)
  const byDate: Record<string, ProgressPhoto[]> = {}
  for (const p of [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())) {
    const key = p.date.slice(0, 10)
    if (!byDate[key]) byDate[key] = []
    byDate[key].push(p)
  }
  const dateGroups = Object.entries(byDate)

  // Which positions have ≥2 photos? (for compare button)
  const positionsWithMultiple = ALL_POSITIONS.filter(pos => photos.filter(p => p.position === pos).length >= 2)

  const openLightbox = (groupPhotos: ProgressPhoto[], idx: number) => {
    setLightboxPhotos(groupPhotos)
    setLightboxIdx(idx)
  }

  return (
    <div className="space-y-4">
      {/* Position filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {(['ALL', ...ALL_POSITIONS] as const).map(pos => (
          <button
            key={pos}
            type="button"
            onClick={() => setFilterPos(pos)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filterPos === pos
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {pos === 'ALL' ? 'Todas' : POSITION_LABELS[pos]}
          </button>
        ))}
      </div>

      {/* Comparison button */}
      {comparePos === null && positionsWithMultiple.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setComparePos(positionsWithMultiple[0])}
        >
          <ArrowLeftRight size={14} className="mr-1.5" />
          Comparar fotos
        </Button>
      )}

      {/* Comparison view */}
      {comparePos !== null && (
        <div className="rounded-xl border border-border bg-card p-3 space-y-2">
          <div className="flex gap-1 overflow-x-auto">
            {positionsWithMultiple.map(pos => (
              <button
                key={pos}
                type="button"
                onClick={() => setComparePos(pos)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  comparePos === pos
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {POSITION_LABELS[pos]}
              </button>
            ))}
          </div>
          <ComparisonView
            photos={photos}
            position={comparePos}
            onClose={() => setComparePos(null)}
          />
        </div>
      )}

      {/* Date-grouped grid */}
      {dateGroups.map(([dateKey, groupPhotos]) => (
        <div key={dateKey}>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {format(new Date(dateKey + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {groupPhotos.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => openLightbox(groupPhotos, i)}
                className="block"
              >
                <div className="relative">
                  <PhotoCard photo={photo} onDelete={onDelete} />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {lightboxPhotos && (
        <Lightbox
          photos={lightboxPhotos}
          startIndex={lightboxIdx}
          onClose={() => setLightboxPhotos(null)}
        />
      )}
    </div>
  )
}
