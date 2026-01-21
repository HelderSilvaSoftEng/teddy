import { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../presentation';
import {
  LoginPage,
  RecoveryPasswordPage,
  ResetPasswordPage,
  CustomersPage,
  SelectedCustomersPage,
} from '../adapters/components/pages';
import { DashboardPage } from '../presentation/pages/dashboard-page';
import { UserManagementModal } from '../adapters/components/modals/user-management-modal';
import '../styles.css';

export function App() {
  const { isAuthenticated } = useAuth();
  const [showUserModal, setShowUserModal] = useState(false);

  // Carregar usuário ao montar
  useEffect(() => {
    if (isAuthenticated) {
      // Aqui você pode adicionar lógica para carregar o usuário atual
      // const user = await getCurrentUser();
      // setUser(user);
    }
  }, []);

  // Wrapper para CustomersPage que recebe onOpenUserModal
  const CustomersPageWrapper = () => (
    <CustomersPage onOpenUserModal={() => setShowUserModal(true)} />
  );

  // Wrapper para SelectedCustomersPage que recebe onOpenUserModal
  const SelectedCustomersPageWrapper = () => (
    <SelectedCustomersPage onOpenUserModal={() => setShowUserModal(true)} />
  );

  // Wrapper para DashboardPage que recebe onOpenUserModal
  const DashboardPageWrapper = () => (
    <DashboardPage onOpenUserModal={() => setShowUserModal(true)} />
  );

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recovery-password" element={<RecoveryPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Rotas protegidas */}
        {isAuthenticated ? (
          <>
            <Route path="/" element={<CustomersPageWrapper />} />
            <Route path="/customers" element={<CustomersPageWrapper />} />
            <Route path="/dashboard" element={<DashboardPageWrapper />} />
            <Route path="/selected-customers" element={<SelectedCustomersPageWrapper />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>

      {isAuthenticated && (
        <UserManagementModal 
          isOpen={showUserModal} 
          onClose={() => setShowUserModal(false)}
        />
      )}
    </>
  );
}

export default App;
