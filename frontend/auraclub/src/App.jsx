import { Routes, Route, useNavigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'

import { UserProvider } from './context/userContext'
import { PromotionProvider } from './context/PromotionContext'


import { ProfilePage } from './pages/profile/ProfilePage'
import { DashboardPage } from './pages/DashboardPage'
import { MyPromotionsPage } from './pages/profile/MyPromotionsPage'
import { MyTransactionsPage } from './pages/profile/MyTransactionsPage'

import { ChangePasswordPage} from './pages/profile/ChangePasswordPage'
import { ResetPasswordPage} from './pages/profile/ResetPaswordPage'


import { ManageUserPage } from './pages/user/ManageUserPage'
import { ViewAllUserPage } from './pages/user/ViewAllUserPage'
import { ViewUserPage } from './pages/user/ViewUserPage'
import { EditUserPage } from './pages/user/EditUserPage'
import { RegisterUserPage } from './pages/user/RegisterUserPage'


import { ManageTransactionPage } from './pages/transaction/ManageTransactionPage'
import { CreatePurchaseTransactionPage } from './pages/transaction/CreatePurchaseTransactionPage'
import { CreateAdjustmentTransactionPage } from './pages/transaction/CreateAdjustmentTransactionPage'
import { CreateTransferTransactionPage } from './pages/transaction/CreateTransferTransactionPage'
import { CreateRedemptionTransactionPage } from './pages/transaction/CreateRedemptionTransactionPage'
import { ProcessRedemptionPage } from './pages/transaction/ProcessRedemptionPage'
import { ViewTransactionPage } from './pages/transaction/ViewTransactionPage'

import { ViewAvailablePromotionPage } from './pages/promotion/ViewAvailablePromotionPage'
import { ManagePromotionPage } from './pages/promotion/ManagePromotionPage'
import { ViewPromotionPage } from './pages/promotion/ViewPromotionPage'
import { CreatePromotionPage } from './pages/promotion/CreatePromotionPage'
import { ViewAllPromotionPage } from './pages/promotion/ViewAllPromotionPage'
import { EditPromotionPage} from './pages/promotion/EditPromotionPage'
import { TransactionProvider } from './context/TransactionContext'
import { ViewAllTransactionPage } from './pages/transaction/ViewAllTransactionPage'

import { ManageEventsPage } from './pages/event/ManageEventsPage'
import CreateEventPage from './pages/event/CreateEventPage'
import { EventProvider } from './context/EventContext'


function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />

      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/change-password" element={<ChangePasswordPage />} />

      <Route path="/reset" element={<ResetPasswordPage />} />

      {/** Profile pages */}

      <Route path="/dashboard" element={<DashboardPage />} />
      
      <Route path="/profile" element={<ProfilePage />} />

      <Route 
        path="/promotions"
        element={
            <UserProvider>
            <PromotionProvider>
            <MyPromotionsPage />
            </PromotionProvider>
            </UserProvider>
        }
      />

      <Route 
        path="/points/transfer"
        element={
            <UserProvider>
            <PromotionProvider>
            <CreateTransferTransactionPage />
            </PromotionProvider>
            </UserProvider>
        }
      />

      <Route 
        path="/transactions"
        element={
            <UserProvider>
            <TransactionProvider>
            <MyTransactionsPage />
            </TransactionProvider>
            </UserProvider>
        }
      />


      {/** User points */}
      <Route
        path="/points/redemption/create"
        element={
          <UserProvider>
            <TransactionProvider>
              <CreateRedemptionTransactionPage />
            </TransactionProvider>
          </UserProvider>
        }
      />


      {/** Manage Users */}
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

      <Route
        path="/manage/transactions/view/:transactionId"
        element={
          <UserProvider>
            <TransactionProvider>
              <ViewTransactionPage />
            </TransactionProvider>
          </UserProvider>
        }
      />

      <Route
        path="/manage/transactions/purchase/create"
        element={
          <UserProvider>
            <TransactionProvider>
              <CreatePurchaseTransactionPage />
            </TransactionProvider>
          </UserProvider>
        }
      />

      <Route
        path="/manage/transactions/adjustment/create"
        element={
          <UserProvider>
            <TransactionProvider>
              <CreateAdjustmentTransactionPage />
            </TransactionProvider>
          </UserProvider>
        }
      />

      <Route
        path="/manage/transactions/all"
        element={
          <UserProvider>
            <TransactionProvider>
              <ViewAllTransactionPage />
            </TransactionProvider>
          </UserProvider>
        }
      />

      <Route
        path="/points/redemption/process"
        element={
          <UserProvider>
            <TransactionProvider>
              <ProcessRedemptionPage />
            </TransactionProvider>
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

      {/** Manage Events */}
      <Route
        path="/manage/events"
        element={
            <ManageEventsPage />
        }
      />

      <Route
        path="/manage/events/create"
        element={
          <UserProvider>
            <EventProvider>
              <CreateEventPage/>
            </EventProvider>
          </UserProvider>
        }
      />
    </Routes>
  )
}

export default App