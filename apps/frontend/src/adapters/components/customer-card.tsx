import { useState } from 'react';
import { Customer } from '../../domain';
import { useSelectedCustomers } from '../../presentation';
import './customer-card.css';

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomerCard({ customer, onEdit, onDelete }: CustomerCardProps) {
  const { selectedCustomers, toggleCustomer } = useSelectedCustomers();
  const [isSelected, setIsSelected] = useState(selectedCustomers.some((c: Customer) => c.id === customer.id));

  const handleToggleSelection = () => {
    toggleCustomer(customer);
    setIsSelected(!isSelected);
  };

  const formatSalary = (salary: number | undefined) => {
    if (!salary) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(salary);
  };

  return (
    <div className={`customer-card ${isSelected ? 'selected' : ''}`}>
      <div className="customer-header">
        <div className="customer-selection">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleToggleSelection}
            className="customer-checkbox"
            title="Selecionar cliente"
          />
        </div>
        <h3>{customer.name || 'Sem nome'}</h3>
      </div>
      <div className="customer-info">
        {customer.salary && (
          <p className="salary">Salário: {formatSalary(customer.salary)}</p>
        )}
        {customer.company && (
          <p className="company">Empresa: {customer.company}</p>
        )}
      </div>
      <div className="customer-actions">
        <button 
          className="action-btn edit-btn" 
          onClick={() => onEdit(customer)}
          title="Editar"
        >
          ✎
        </button>
        <button 
          className="action-btn delete-btn" 
          onClick={() => onDelete(customer)}
          title="Deletar"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
