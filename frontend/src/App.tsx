import { Navigate, Route, Routes } from 'react-router'
import { useAuth } from './auth/context/useAuth'
import { LoginPage } from './auth/pages/LoginPage'
import { ScorePage } from './score/pages/ScorePage'

function LoginRoute() {
  const { principal } = useAuth()

  return principal ? <Navigate to="/score" replace /> : <LoginPage />
}

function ScoreRoute() {
  const { principal } = useAuth()

  return principal ? <ScorePage /> : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/score" element={<ScoreRoute />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
