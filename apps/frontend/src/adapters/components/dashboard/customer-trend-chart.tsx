import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardService } from '../../../infra/services/dashboard.service';
import type { CustomerTrendData } from '../../../domain/dashboard/dashboard.types';
import styles from './customer-trend-chart.module.css';

interface CustomerTrendChartProps {
  period: 'monthly' | 'daily';
}

export const CustomerTrendChart: React.FC<CustomerTrendChartProps> = ({ period }) => {
  const [data, setData] = useState<CustomerTrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrendData = async () => {
      try {
        setError(null);
        setIsLoading(true);

        const trendData = period === 'monthly'
          ? await dashboardService.getCustomerTrendByMonth(12)
          : await dashboardService.getCustomerTrendByDay(30);

        setData(trendData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
        setError(errorMessage);
        console.error('Erro ao carregar tendência:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendData();
  }, [period]);

  if (isLoading) {
    return <div className={styles.loading}>Carregando gráfico...</div>;
  }

  if (error) {
    return <div className={styles.error}>❌ {error}</div>;
  }

  if (!data || data.length === 0) {
    return <div className={styles.empty}>Sem dados disponíveis para este período</div>;
  }

  const dataKey = period === 'monthly' ? 'month' : 'day';

  return (
    <div className={styles.container}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey={dataKey}
            angle={-45}
            textAnchor="end"
            height={100}
            style={{ fontSize: '12px' }}
          />
          <YAxis label={{ value: 'Total de Clientes', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value) => [`${value} clientes`, 'Total']}
            labelFormatter={(label) => `Período: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            name="Clientes Criados"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
