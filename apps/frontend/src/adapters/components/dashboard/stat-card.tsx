import styles from './stat-card.module.css';

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'blue' }) => {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <h3 className={styles.title}>{title}</h3>
      </div>
      <p className={styles.value}>{value.toLocaleString('pt-BR')}</p>
    </div>
  );
};
