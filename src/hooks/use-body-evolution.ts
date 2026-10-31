import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bodyMeasurementsService } from '@/services/body-measurements/body-measurements.service'

export function useBodyEvolution(studentId?: string) {
  const queryClient = useQueryClient()
  const queryKey = ['body-evolution', studentId]
  const measurementsQuery = useQuery({
    queryKey,
    enabled: Boolean(studentId),
    queryFn: () => bodyMeasurementsService.getAll(studentId!),
  })
  const progressQuery = useQuery({
    queryKey: ['body-evolution-progress', studentId],
    enabled: Boolean(studentId),
    queryFn: () => bodyMeasurementsService.getProgress(studentId!),
  })
  const createMeasurement = useMutation({
    mutationFn: bodyMeasurementsService.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['body-evolution', variables.studentId] })
    },
  })
  return { measurementsQuery, progressQuery, createMeasurement }
}
