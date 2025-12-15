import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Toaster } from 'sonner'
import { ProtectedRoute, PublicRoute } from '@/components/guards'
import {
  DashboardPage,
  LoginPage,
  RegisterPage,
  DepositPage,
  TransferPage,
  WithdrawPage,
  ActivityPage,
  ProfilePage,
  AgentsPage,
  MarketsPage,
} from '@/pages'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/deposit" element={<DepositPage />} />
            <Route path="/transfer" element={<TransferPage />} />
            <Route path="/withdraw" element={<WithdrawPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/markets" element={<MarketsPage />} />
          </Route>
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

