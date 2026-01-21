import React, { useState } from 'react';
import { Customer } from '../../../domain';
import './create-customer-modal.css';

interface CreateCustomerModalProps {
  onClose: () => void;
  onCreate: (data: Partial<Customer>) => Promise<void>;
}

export function CreateCustomerModal({ onClose, onCreate }: CreateCustomerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    salary: '',
    company: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      validationErrors.name = 'Nome é obrigatório';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      await onCreate({
        name: formData.name,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        company: formData.company || undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Criar cliente</h2>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Digite o nome:"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <input
              type="number"
              name="salary"
              placeholder="Digite o salário (opcional):"
              value={formData.salary}
              onChange={handleChange}
              step="0.01"
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="company"
              placeholder="Digite o valor da empresa (opcional):"
              value={formData.company}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar cliente'}
            </button>
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
