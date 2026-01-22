import React from 'react';
import styles from './trend-period-toggle.module.css';

interface TrendPeriodToggleProps {
  period: 'monthly' | 'daily';
  onPeriodChange: (period: 'monthly' | 'daily') => void;
}

export const TrendPeriodToggle: React.FC<TrendPeriodToggleProps> = ({ period, onPeriodChange }) => {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${period === 'monthly' ? styles.active : ''}`}
        onClick={() => onPeriodChange('monthly')}
      >
        📅 Mensal (12 meses)
      </button>
      <button
        className={`${styles.button} ${period === 'daily' ? styles.active : ''}`}
        onClick={() => onPeriodChange('daily')}
      >
        📆 Diário (30 dias)
      </button>
    </div>
  );
};
