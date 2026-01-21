import type { RecentUser } from '../../../domain/dashboard/dashboard.types';
import styles from './recent-users-table.module.css';

interface RecentUsersTableProps {
  users: RecentUser[];
  isLoading?: boolean;
}

export const RecentUsersTable: React.FC<RecentUsersTableProps> = ({ users, isLoading = false }) => {
  if (isLoading) {
    return <div className={styles.loading}>Carregando usuários...</div>;
  }

  if (users.length === 0) {
    return <div className={styles.empty}>Nenhum usuário encontrado</div>;
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Nome</th>
            <th>Data de Criação</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className={styles.email}>{user.email}</td>
              <td>{user.name}</td>
              <td className={styles.date}>
                {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
