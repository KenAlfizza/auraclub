import { Routes, Route, useNavigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProfilePage } from './pages/ProfilePage'
import { DashboardPage } from './pages/DashboardPage'


import { CreatePromotionPage } from './pages/manager/promotion/CreatePromotionPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<CreatePromotionPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProfilePage />} />

    </Routes>
  )
}

export default App