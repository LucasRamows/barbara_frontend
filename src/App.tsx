import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { SessionProvider, useSession } from '@/contexts/SessionContext'
import AuthLayout from './_auth/AuthLayout'
import SigninForm from './_auth/forms/SigninForm'
import { StudentLayout } from './_root/layouts/StudentLayout'
import { PersonalLayout } from './_root/layouts/PersonalLayout'
import { AdminLayout } from './_root/layouts/AdminLayout'
import type { Role } from '@/types/auth.types'

// Student pages
const StudentToday = lazy(() => import('./_root/main/student/StudentToday'))
const StudentHistory = lazy(() => import('./_root/main/student/StudentHistory'))
const StudentEvolution = lazy(() => import('./_root/main/student/StudentEvolution'))
const StudentGifts = lazy(() => import('./_root/main/student/StudentGifts'))
const StudentProfile = lazy(() => import('./_root/main/student/StudentProfile'))

// Personal pages
const PersonalDashboard = lazy(() => import('./_root/main/personal/PersonalDashboard'))
const PersonalStudents = lazy(() => import('./_root/main/personal/PersonalStudents'))
const PersonalWorkouts = lazy(() => import('./_root/main/personal/PersonalWorkouts'))
const PersonalGifts = lazy(() => import('./_root/main/personal/PersonalGifts'))
const PersonalProfile = lazy(() => import('./_root/main/personal/PersonalProfile'))

// Admin pages
const AdminOverview = lazy(() => import('./_root/main/admin/AdminOverview'))
const AdminPersonals = lazy(() => import('./_root/main/admin/AdminPersonals'))
const AdminCriteria = lazy(() => import('./_root/main/admin/AdminCriteria'))
const AdminSettings = lazy(() => import('./_root/main/admin/AdminSettings'))
const AdminProfile = lazy(() => import('./_root/main/admin/AdminProfile'))

const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
)

function homeForRole(role: Role): string {
  if (role === 'SUPER_ADMIN') return '/admin'
  if (role === 'PERSONAL') return '/personal'
  return '/'
}

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles: Role[]
}) {
  const { user, sessionReady } = useSession()

  if (!sessionReady) return <PageLoader />
  if (!user) return <Navigate to="/sign-in" replace />
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />
  }
  return <>{children}</>
}

function CatchAll() {
  const { user, sessionReady } = useSession()
  if (!sessionReady) return <PageLoader />
  if (!user) return <Navigate to="/sign-in" replace />
  return <Navigate to={homeForRole(user.role)} replace />
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm />} />
        </Route>

        {/* ALUNO */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['ALUNO']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<StudentToday />} />
          <Route path="/historico" element={<StudentHistory />} />
          <Route path="/evolucao" element={<StudentEvolution />} />
          <Route path="/gifts" element={<StudentGifts />} />
          <Route path="/perfil" element={<StudentProfile />} />
        </Route>

        {/* PERSONAL */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['PERSONAL']}>
              <PersonalLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/personal" element={<PersonalDashboard />} />
          <Route path="/personal/alunos" element={<PersonalStudents />} />
          <Route path="/personal/treinos" element={<PersonalWorkouts />} />
          <Route path="/personal/gifts" element={<PersonalGifts />} />
          <Route path="/personal/perfil" element={<PersonalProfile />} />
        </Route>

        {/* SUPER_ADMIN */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/personals" element={<AdminPersonals />} />
          <Route path="/admin/criterios" element={<AdminCriteria />} />
          <Route path="/admin/configuracoes" element={<AdminSettings />} />
          <Route path="/admin/perfil" element={<AdminProfile />} />
        </Route>

        <Route path="*" element={<CatchAll />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <SessionProvider>
      <AppRoutes />
      <Toaster richColors position="top-center" />
    </SessionProvider>
  )
}
