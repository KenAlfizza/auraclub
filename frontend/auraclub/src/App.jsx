import { Routes, Route, useNavigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'

import { ProfilePage } from './pages/profile/ProfilePage'
import { DashboardPage } from './pages/DashboardPage'
import { ChangePasswordPage} from './pages/profile/ChangePasswordPage'
import { ResetPasswordPage} from './pages/profile/ResetPaswordPage'

import { UserProvider } from './context/userContext'
import { PromotionProvider } from './context/PromotionContext'

import { ManageUserPage } from './pages/user/ManageUserPage'
import { ViewAllUserPage } from './pages/user/ViewAllUserPage'
import { ViewUserPage } from './pages/user/ViewUserPage'
import { EditUserPage } from './pages/user/EditUserPage'
import { RegisterUserPage } from './pages/user/RegisterUserPage'


import { ManageTransactionPage } from './pages/transaction/ManageTransactionPage'

import { ViewAvailablePromotionPage } from './pages/promotion/ViewAvailablePromotionPage'
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
      
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />

      <Route path="/reset" element={<ResetPasswordPage />} />
      

      <Route 
        path="/promotions"
        element={
            <UserProvider>
            <PromotionProvider>
            <ViewAvailablePromotionPage />
            </PromotionProvider>
            </UserProvider>
        }
      />

      <Route 
        path="/manage/users"
        element={
            <UserProvider>
            <ManageUserPage />
            </UserProvider>
        }
      />

      <Route 
        path="/manage/users/all"
        element={
            <UserProvider>
            <ViewAllUserPage />
            </UserProvider>
        }
      />

      <Route 
        path="/manage/users/register" 
        element={
          <RegisterUserPage />
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

      {/** Manage Transactions */}
      <Route
        path="/manage/transactions"
        element={
          <UserProvider>
              <ManageTransactionPage />
          </UserProvider>
        }
      />


      {/** Manage Promotions */}
      <Route
        path="/manage/promotions"
        element={
          <UserProvider>
              <ManagePromotionPage />
          </UserProvider>
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