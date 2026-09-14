import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import { LoginPage } from '@/features/auth/LoginPage'
import { AnonymousOnlyRoute, ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { useThemeEffect } from '@/features/theme/useThemeEffect'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { ApplicationsPage } from '@/pages/ApplicationsPage'
import { BoardPage } from '@/pages/BoardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  useThemeEffect()

  return (
    <Routes>
      <Route element={<AnonymousOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/applications" replace />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
