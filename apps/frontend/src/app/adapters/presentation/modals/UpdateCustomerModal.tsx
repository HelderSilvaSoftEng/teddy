import { useState } from 'react';
import { ICustomer } from '../../../../../domain/entities/customer';
import '../styles/modals.css';

interface UpdateCustomerModalProps {
  isOpen: boolean;
  customer: ICustomer | null;
  onClose: () => void;
  onSubmit: (customer: Omit<ICustomer, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isLoading?: boolean;
}

export function UpdateCustomerModal({
  isOpen,
  customer,
  onClose,
  onSubmit,
  isLoading = false,
}: UpdateCustomerModalProps) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    personalId: customer?.personalId || '',
    mobile: customer?.mobile || '',
    salary: customer?.salary || '',
    company: customer?.company || '',
  });

  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    try {
      await onSubmit({
        name: formData.name,
        personalId: formData.personalId || undefined,
        mobile: formData.mobile || undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        company: formData.company || undefined,
        status: 'ACTIVE',
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cliente');
    }
  };

  const handleClose = () => {
    setFormData({
      name: customer?.name || '',
      personalId: customer?.personalId || '',
      mobile: customer?.mobile || '',
      salary: customer?.salary?.toString() || '',
      company: customer?.company || '',
    });
    setError('');
    onClose();
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Cliente</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Nome *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nome do cliente"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="personalId">CPF</label>
            <input
              id="personalId"
              type="text"
              name="personalId"
              value={formData.personalId}
              onChange={handleInputChange}
              placeholder="CPF (opcional)"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Telefone</label>
            <input
              id="mobile"
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Telefone (opcional)"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="salary">Salário</label>
            <input
              id="salary"
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              placeholder="Salário (opcional)"
              step="0.01"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="company">Empresa</label>
            <input
              id="company"
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="Empresa (opcional)"
              disabled={isLoading}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Atualizando...' : 'Atualizar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
