import { Customer } from '../../domain';
import './customer-card.css';

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomerCard({ customer, onEdit, onDelete }: CustomerCardProps) {
  const formatSalary = (salary: number | undefined) => {
    if (!salary) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(salary);
  };

  return (
    <div className="customer-card">
      <div className="customer-content">
        <h3>{customer.name || 'Sem nome'}</h3>
        {customer.salary && (
          <p className="salary">Salário: {formatSalary(customer.salary)}</p>
        )}
        {customer.company && (
          <p className="company">Empresa: {customer.company}</p>
        )}
      </div>
      <div className="customer-actions">
        <button 
          className="action-btn add-btn" 
          onClick={() => onEdit(customer)}
          title="Adicionar"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
        <button 
          className="action-btn edit-btn" 
          onClick={() => onEdit(customer)}
          title="Editar"
        >
          <span className="material-symbols-outlined">ink_pen</span>
        </button>
        <button 
          className="action-btn delete-btn" 
          onClick={() => onDelete(customer)}
          title="Deletar"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  );
}
