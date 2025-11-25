import { Routes, Route, useNavigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProfilePage } from './pages/ProfilePage'
import { DashboardPage } from './pages/DashboardPage'

import { PromotionProvider } from './context/PromotionContext'

import { ManagePromotionPage } from './pages/manager/promotion/ManagePromotionPage'
import { ViewPromotionPage } from './pages/manager/promotion/ViewPromotionPage'
import { CreatePromotionPage } from './pages/manager/promotion/CreatePromotionPage'
import { ViewAllPromotionPage } from './pages/manager/promotion/ViewAllPromotionPage'
import { EditPromotionPage} from './pages/manager/promotion/EditPromotionPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route
        path="/manage/promotions"
        element={
            <ManagePromotionPage />
        }
      />

      <Route
        path="/manage/promotions/all"
        element={
          <PromotionProvider>
            <ViewAllPromotionPage />
          </PromotionProvider>
        }
      />

      <Route
        path="/manage/promotions/view/:id"
        element={
          <PromotionProvider>
            <ViewPromotionPage />
          </PromotionProvider>
        }
      />

      <Route
        path="/manage/promotions/create"
        element={
          <PromotionProvider>
            <CreatePromotionPage />
          </PromotionProvider>
        }
      />

      <Route
        path="/manage/promotions/edit"
        element={
          <PromotionProvider>
            <EditPromotionPage />
          </PromotionProvider>
        }
      />

    </Routes>
  )
}

export default App