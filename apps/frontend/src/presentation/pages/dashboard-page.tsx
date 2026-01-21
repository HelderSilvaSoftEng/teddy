import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/auth.context';
import { dashboardService } from '../../infra/services/dashboard.service';
import type { DashboardStatistics, RecentUser } from '../../domain/dashboard/dashboard.types';
import { StatCard } from '../../adapters/components/dashboard/stat-card';
import { RecentUsersTable } from '../../adapters/components/dashboard/recent-users-table';
import styles from './dashboard-page.module.css';

export const DashboardPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadData = async () => {
      try {
        setError(null);
        setIsLoadingStats(true);
        setIsLoadingUsers(true);

        const [statsData, usersData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentUsers(5),
        ]);

        setStats(statsData);
        setRecentUsers(usersData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dashboard';
        setError(errorMessage);
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setIsLoadingStats(false);
        setIsLoadingUsers(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className={styles.notAuthenticated}>
        <p>Você precisa estar autenticado para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>📊 Dashboard</h1>
        <p className={styles.subtitle}>Bem-vindo, {user?.email}!</p>
      </header>

      {error && (
        <div className={styles.error}>
          <span>⚠️ {error}</span>
        </div>
      )}

      <section className={styles.statsGrid}>
        <StatCard
          title="Total de Usuários"
          value={stats?.totalUsers ?? 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Total de Clientes"
          value={stats?.totalCustomers ?? 0}
          icon="🏢"
          color="green"
        />
        <StatCard
          title="Total de Auditoria"
          value={stats?.totalAuditLogs ?? 0}
          icon="📋"
          color="purple"
        />
        <StatCard
          title="Status"
          value={stats ? 200 : 0}
          icon="✅"
          color="orange"
        />
      </section>

      <section className={styles.recentUsersSection}>
        <h2>Usuários Recentes</h2>
        <RecentUsersTable users={recentUsers} isLoading={isLoadingUsers} />
      </section>

      {stats && (
        <footer className={styles.footer}>
          <p>Dados atualizados em: {new Date(stats.retrievedAt).toLocaleString('pt-BR')}</p>
        </footer>
      )}
    </div>
  );
};
