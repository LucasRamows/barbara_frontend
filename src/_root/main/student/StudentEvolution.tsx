import { lazy, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudentProfile } from '@/hooks/useStudentProfile'
import { progressPhotosService } from '@/services/progress-photos/progress-photos.service'
import { useBodyEvolution } from '@/hooks/use-body-evolution'
import { MeasurementsView } from '@/components/evolution/MeasurementsView'
import { PhotosView } from '@/components/evolution/PhotosView'

const WeightEvolutionChart = lazy(() =>
  import('@/components/evolution/WeightEvolutionChart').then((module) => ({
    default: module.WeightEvolutionChart,
  })),
)

export default function StudentEvolution() {
  const { profileId, loading: profileLoading } = useStudentProfile()
  const { measurementsQuery } = useBodyEvolution(profileId ?? undefined)
  const photosQuery = useQuery({
    queryKey: ['progress-photos', profileId],
    enabled: Boolean(profileId),
    queryFn: () => progressPhotosService.getAll(profileId!),
  })
  const measurements = measurementsQuery.data ?? []
  const photos = photosQuery.data ?? []

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
          <MeasurementsView measurements={measurements} photos={photos} loading={measurementsQuery.isPending} />
          <Suspense fallback={<Skeleton className="mt-4 h-40 w-full rounded-xl" />}>
            <WeightEvolutionChart measurements={measurements} />
          </Suspense>
        </TabsContent>
        <TabsContent value="fotos" className="mt-4">
          <PhotosView photos={photos} loading={photosQuery.isPending} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
