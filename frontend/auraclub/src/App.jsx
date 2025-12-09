import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';

// Pages
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { DashboardPage } from './pages/dashboard/roles/DashboardPage';
import { ChangePasswordPage } from './pages/profile/ChangePasswordPage';
import { ResetPasswordPage } from './pages/profile/ResetPaswordPage';
import { UnauthorizedPage } from './pages/errors/UnautorizedPage';

// Regular user pages
import RegularDashboardPage from './pages/roles/regular/RegularDashboardPage';
import { RegularPointsPage } from './pages/roles/regular/RegularPointsPage';
import { RegularTransactionsPage } from './pages/roles/regular/RegularTransactionsPage';
import { RegularPromotionsPage } from './pages/roles/regular/RegularPromotionsPage';
import { RegularEventsPage } from './pages/roles/regular/RegularEventsPage';

// Cashier pages
import CashierDashboardPage from './pages/roles/cashier/CashierDashboardPage';
import CashierTransactionPage from './pages/roles/cashier/CashierTransactionPage';

// Transaction pages
import { CreatePurchaseTransactionPage } from './pages/transaction/CreatePurchaseTransactionPage';
import { CreateRedemptionTransactionPage } from './pages/transaction/CreateRedemptionTransactionPage';
import { ProcessRedemptionPage } from './pages/transaction/ProcessRedemptionPage';
import { CreateAdjustmentTransactionPage } from './pages/transaction/CreateAdjustmentTransactionPage';
import { CreateTransferTransactionPage } from './pages/transaction/CreateTransferTransactionPage';
import { ViewTransactionPage } from './pages/transaction/ViewTransactionPage';

// Manager pages
import { ManageUserPage } from './pages/roles/manager/ManageUserPage';
import { ManageTransactionPage } from './pages/roles/manager/ManageTransactionPage';
import { ManagePromotionPage } from './pages/roles/manager/ManagePromotionPage';
import { RegisterUserPage } from './pages/user/RegisterUserPage';
import { ViewUserPage } from './pages/user/ViewUserPage';
import { EditUserPage } from './pages/user/EditUserPage';
import { ViewAllPromotionPage } from './pages/promotion/ViewAllPromotionPage';
import { ViewPromotionPage } from './pages/promotion/ViewPromotionPage';
import { CreatePromotionPage } from './pages/promotion/CreatePromotionPage';
import { EditPromotionPage } from './pages/promotion/EditPromotionPage';

// Event pages
import { ManageEventsPage } from './pages/event/ManageEventsPage';
import { CreateEventPage } from './pages/event/CreateEventPage';
import { ViewEventPage } from './pages/event/ViewEventPage';
import { EditEventPage } from './pages/event/EditEventPage';
import { ManageOrganizersPage } from './pages/event/ManageOrganizersPage';
import { ManageGuestsPage } from './pages/event/ManageGuestsPage';
import EventPointAwardsPage from './pages/event/EventPointAwardsPage';

// Context Providers
import { UserProvider } from './context/userContext';
import { PromotionProvider } from './context/PromotionContext';
import { TransactionProvider } from './context/TransactionContext';
import { EventProvider } from './context/EventContext';
import { PointsProvider } from './context/PointsContext';

import { UserContext } from './context/userContext';
import EditProfilePage from './pages/profile/EditProfilePage';
// ProtectedRoute component
function ProtectedRoute({ allowedRoles, children }) {
  const { user, isLoading } = useContext(UserContext);

  if (isLoading) {
    return <div>Loading...</div>; // or a spinner
  }

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Superuser bypass
  if (user.role === "superuser") return children;

  // Unauthorized
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/401" replace />;
  }

  return children;
}


function App() {
  return (
    <UserProvider>
      <PromotionProvider>
        <TransactionProvider>
          <EventProvider>
            <PointsProvider>
              <Routes>

                <Route path="/401" element={<UnauthorizedPage />} />

                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
                <Route path="/reset" element={<ResetPasswordPage />} />

                {/* Profile */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={['regular', 'cashier', 'manager', 'organizer']}>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile/edit"
                  element={
                    <ProtectedRoute allowedRoles={['regular', 'cashier', 'manager', 'organizer']}>
                      <EditProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Regular User Dashboard */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['regular', 'cashier', 'manager']}>
                      <RegularDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Regular User Pages */}
                <Route
                  path="/points"
                  element={
                    <ProtectedRoute allowedRoles={['regular', 'cashier', 'manager']}>
                      <RegularPointsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/points/transfer"
                  element={
                    <ProtectedRoute allowedRoles={['regular', 'cashier', 'manager']}>
                      <CreateTransferTransactionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/points/redeem"
                  element={
                    <ProtectedRoute allowedRoles={['regular', 'cashier', 'manager']}>
                      <CreateRedemptionTransactionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute allowedRoles={['regular', 'cashier', 'manager']}>
                      <RegularTransactionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/promotions"
                  element={
                    <ProtectedRoute allowedRoles={['regular', 'cashier', 'manager']}>
                      <RegularPromotionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events"
                  element={
                    <ProtectedRoute allowedRoles={['regular', 'cashier', 'manager']}>
                      <RegularEventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/:id"
                  element={
                    <ProtectedRoute allowedRoles={['regular', 'cashier', 'manager']}>
                      <ViewEventPage displayType="regular" />
                    </ProtectedRoute>
                  }
                />

                {/* Cashier Routes */}
                <Route
                  path="/cashier"
                  element={
                    <ProtectedRoute allowedRoles={['cashier', 'manager']}>
                      <CashierDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cashier/purchase"
                  element={
                    <ProtectedRoute allowedRoles={['cashier', 'manager']}>
                      <CreatePurchaseTransactionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cashier/redemption"
                  element={
                    <ProtectedRoute allowedRoles={['cashier', 'manager']}>
                      <ProcessRedemptionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cashier/transactions"
                  element={
                    <ProtectedRoute allowedRoles={['cashier', 'manager']}>
                      <CashierTransactionPage />
                    </ProtectedRoute>
                  }
                />

                {/* Manager Routes */}
                <Route
                  path="/manage/users"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ManageUserPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage/users/register"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <RegisterUserPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage/users/view/:id"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ViewUserPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage/users/edit/:id"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <EditUserPage />
                    </ProtectedRoute>
                  }
                />

                {/* Manager Transaction Routes */}
                <Route
                  path="/manage/transactions"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ManageTransactionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage/transactions/view/:transactionId"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ViewTransactionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage/transactions/purchase/create"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <CreatePurchaseTransactionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage/transactions/adjustment/create"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <CreateAdjustmentTransactionPage />
                    </ProtectedRoute>
                  }
                />

                {/* Manager Promotion Routes */}
                <Route
                  path="/manage/promotions"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ManagePromotionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage/promotions/all"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ViewAllPromotionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage/promotions/view/:id"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ViewPromotionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage/promotions/create"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <CreatePromotionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage/promotions/edit/:id"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <EditPromotionPage />
                    </ProtectedRoute>
                  }
                />

                {/* Event Routes */}
                <Route
                  path="/manage/events"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'organizer']}>
                      <ManageEventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage/events/create"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <CreateEventPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage/events/:id"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'organizer']}>
                      <ViewEventPage displayType="manager" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage/events/:id/edit"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'organizer']}>
                      <EditEventPage displayType="manager" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage/events/:id/organizers"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ManageOrganizersPage displayType="manager" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage/events/:id/guests"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ManageGuestsPage displayType="manager" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage/events/:id/awards"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'organizer']}>
                      <EventPointAwardsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </PointsProvider>
          </EventProvider>
        </TransactionProvider>
      </PromotionProvider>
    </UserProvider>
  );
}

export default App;
