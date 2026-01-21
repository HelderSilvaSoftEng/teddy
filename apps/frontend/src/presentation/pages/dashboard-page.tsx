import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/auth.context';
import { Header } from '../../adapters/components/common/header';
import { dashboardService } from '../../infra/services/dashboard.service';
import type { DashboardStatistics, RecentUser } from '../../domain/dashboard/dashboard.types';
import { StatCard } from '../../adapters/components/dashboard/stat-card';
import { RecentUsersTable } from '../../adapters/components/dashboard/recent-users-table';
import { CustomerTrendChart } from '../../adapters/components/dashboard/customer-trend-chart';
import { TrendPeriodToggle } from '../../adapters/components/dashboard/trend-period-toggle';
import styles from './dashboard-page.module.css';

export const DashboardPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [recentCustomers, setRecentCustomers] = useState<RecentUser[]>([]);
  const [trendPeriod, setTrendPeriod] = useState<'monthly' | 'daily'>('monthly');
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadData = async () => {
      try {
        setError(null);
        setIsLoadingStats(true);
        setIsLoadingCustomers(true);

        const [statsData, customersData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentCustomers(5),
        ]);

        setStats(statsData);
        setRecentCustomers(customersData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dashboard';
        setError(errorMessage);
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setIsLoadingStats(false);
        setIsLoadingCustomers(false);
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
    <>
      <Header />
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>📊 Dashboard</h1>
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
      </section>

      <section className={styles.trendSection}>
        <h2>📈 Tendência de Clientes</h2>
        <TrendPeriodToggle period={trendPeriod} onPeriodChange={setTrendPeriod} />
        <CustomerTrendChart period={trendPeriod} />
      </section>

      <section className={styles.recentUsersSection}>
        <h2>Clientes Recentes</h2>
        <RecentUsersTable users={recentCustomers} isLoading={isLoadingCustomers} />
      </section>

      {stats && (
        <footer className={styles.footer}>
          <p>Dados atualizados em: {new Date(stats.retrievedAt).toLocaleString('pt-BR')}</p>
        </footer>
      )}
      </div>
    </>
  );
};
