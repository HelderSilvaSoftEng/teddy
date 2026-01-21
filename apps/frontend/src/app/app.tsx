import { useEffect } from 'react';
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
import '../styles.css';

export function App() {
  const { isAuthenticated } = useAuth();

  // Carregar usuário ao montar
  useEffect(() => {
    if (isAuthenticated) {
      // Aqui você pode adicionar lógica para carregar o usuário atual
      // const user = await getCurrentUser();
      // setUser(user);
    }
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recovery-password" element={<RecoveryPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Rotas protegidas */}
      {isAuthenticated ? (
        <>
          <Route path="/" element={<CustomersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/selected-customers" element={<SelectedCustomersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;
