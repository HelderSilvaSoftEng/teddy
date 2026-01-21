import { useState } from 'react';
import { Customer } from '../../../../domain';
import '../../../adapters/components/modals/create-customer-modal.css';

interface UpdateCustomerModalProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (customer: Omit<Customer, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
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
        salary: formData.salary ? parseFloat(formData.salary as string) : undefined,
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
              className="btn-cancel"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
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
