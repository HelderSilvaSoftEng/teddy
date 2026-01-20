import React from 'react';
import { Customer } from '../../../domain';
import './confirm-delete-modal.css';

interface ConfirmDeleteModalProps {
  customer: Customer;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function ConfirmDeleteModal({ customer, onConfirm, onCancel }: ConfirmDeleteModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">
          Você está preste a excluir o cliente <strong>{customer.name || 'sem nome'}</strong>.
        </p>

        <div className="confirm-actions">
          <button
            className="btn-confirm"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Excluindo...' : 'Excluir cliente'}
          </button>
          <button
            className="btn-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
