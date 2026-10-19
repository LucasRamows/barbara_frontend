import { useEffect, useState } from 'react'
import { useSession } from '@/contexts/SessionContext'
import { api } from '@/lib/api'

export function useStudentProfile() {
  const { user } = useSession()
  const [profileId, setProfileId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    api.get('/users/me').then(r => {
      setProfileId(r.data.studentProfile?.id ?? null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  return { profileId, loading }
}
