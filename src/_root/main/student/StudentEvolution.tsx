import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudentProfile } from '@/hooks/useStudentProfile'
import { bodyMeasurementsService } from '@/services/body-measurements/body-measurements.service'
import { progressPhotosService } from '@/services/progress-photos/progress-photos.service'
import type { BodyMeasurement, ProgressPhoto } from '@/types/evolution.types'
import { MeasurementsView } from '@/components/evolution/MeasurementsView'
import { PhotosView } from '@/components/evolution/PhotosView'

export default function StudentEvolution() {
  const { profileId, loading: profileLoading } = useStudentProfile()
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [measLoading, setMeasLoading] = useState(false)
  const [photosLoading, setPhotosLoading] = useState(false)

  useEffect(() => {
    if (!profileId) return
    setMeasLoading(true)
    setPhotosLoading(true)
    bodyMeasurementsService.getAll(profileId)
      .then(setMeasurements)
      .catch(() => {})
      .finally(() => setMeasLoading(false))
    progressPhotosService.getAll(profileId)
      .then(setPhotos)
      .catch(() => {})
      .finally(() => setPhotosLoading(false))
  }, [profileId])

  if (profileLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="font-display text-2xl font-bold text-foreground">Evolução</h1>
      <Tabs defaultValue="medidas">
        <TabsList className="w-full">
          <TabsTrigger value="medidas" className="flex-1">Medidas</TabsTrigger>
          <TabsTrigger value="fotos" className="flex-1">Fotos</TabsTrigger>
        </TabsList>
        <TabsContent value="medidas" className="mt-4">
          <MeasurementsView measurements={measurements} loading={measLoading} />
        </TabsContent>
        <TabsContent value="fotos" className="mt-4">
          <PhotosView photos={photos} loading={photosLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
