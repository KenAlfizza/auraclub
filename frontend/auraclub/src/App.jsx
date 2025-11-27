import { Routes, Route, useNavigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProfilePage } from './pages/ProfilePage'
import { DashboardPage } from './pages/DashboardPage'

import { UserProvider } from './context/userContext'
import { ManageUserPage } from './pages/user/ManageUserPage'
import { ViewUserPage } from './pages/user/ViewUserPage'
import { EditUserPage } from './pages/user/EditUserPage'


import { PromotionProvider } from './context/PromotionContext'
import { ManagePromotionPage } from './pages/promotion/ManagePromotionPage'
import { ViewPromotionPage } from './pages/promotion/ViewPromotionPage'
import { CreatePromotionPage } from './pages/promotion/CreatePromotionPage'
import { ViewAllPromotionPage } from './pages/promotion/ViewAllPromotionPage'
import { EditPromotionPage} from './pages/promotion/EditPromotionPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      
      <Route 
        path="/manage/users/all"
        element={
            <UserProvider>
            <ManageUserPage />
            </UserProvider>
        }
      />

      <Route 
        path="/manage/users/view/:id"
        element={
            <UserProvider>
            <ViewUserPage />
            </UserProvider>
        }
      />

      <Route 
        path="/manage/users/edit/:id"
        element={
            <UserProvider>
            <EditUserPage />
            </UserProvider>
        }
      />
      
      
      
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
        path="/manage/promotions/edit/:id"
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