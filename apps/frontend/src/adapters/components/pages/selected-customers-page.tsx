import React, { useState, useEffect } from 'react';
import { Customer } from '../../../domain';
import { ListCustomersUseCase, CreateCustomerUseCase, UpdateCustomerUseCase, DeleteCustomerUseCase } from '../../../application';
import { customerRepository } from '../../../infra';
import { Header, Sidebar } from '../common';
import { CustomerCard } from '../customer-card';
import { UpdateCustomerModal } from '../modals/UpdateCustomerModal';
import { ConfirmDeleteModal } from '../modals/confirm-delete-modal';
import './customers-page.css';

const ITEMS_PER_PAGE = 16;

export function SelectedCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const loadCustomers = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const skip = (page - 1) * ITEMS_PER_PAGE;
      const useCase = new ListCustomersUseCase(customerRepository);
      const result = await useCase.execute({ skip, take: ITEMS_PER_PAGE, search: 'SELECTED', searchField: 'status' });
      setCustomers(result.data.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      setTotal(result.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar clientes selecionados';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(currentPage);
  }, [currentPage]);

  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setShowUpdateModal(true);
  };

  const handleUpdateCustomer = async (data: Partial<Customer>) => {
    if (!customerToEdit) return;
    try {
      const useCase = new UpdateCustomerUseCase(customerRepository);
      const updatedCustomer = await useCase.execute(customerToEdit.id, data);
      if (updatedCustomer) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === customerToEdit.id ? updatedCustomer : c))
        );
      }
      setShowUpdateModal(false);
      setCustomerToEdit(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar cliente';
      setError(message);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    try {
      const useCase = new DeleteCustomerUseCase(customerRepository);
      await useCase.execute(customerToDelete.id);
      setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id));
      setCustomerToDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar cliente';
      setError(message);
    }
  };

  const handleDeselectCustomer = async (customer: Customer) => {
    try {
      const useCase = new UpdateCustomerUseCase(customerRepository);
      const updatedCustomer = await useCase.execute(customer.id, { status: 'ACTIVE' });
      if (updatedCustomer) {
        setCustomers((prev) =>
          prev.filter((c) => c.id !== customer.id)
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao desselecionar cliente';
      setError(message);
    }
  };

  const handleClearAllSelected = async () => {
    if (customers.length === 0) return;
    
    setIsClearing(true);
    try {
      const useCase = new UpdateCustomerUseCase(customerRepository);
      
      // Atualiza todos os clientes SELECTED para ACTIVE em paralelo
      const updatePromises = customers.map((customer) =>
        useCase.execute(customer.id, { status: 'ACTIVE' })
      );
      
      await Promise.all(updatePromises);
      
      // Limpa a lista local
      setCustomers([]);
      setTotal(0);
      setCurrentPage(1);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao limpar clientes selecionados';
      setError(message);
    } finally {
      setIsClearing(false);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="customers-layout">
      <Sidebar />
      <Header />

      <div className="customers-content">
        <div className="customers-header">
          <h1>⭐ Clientes Selecionados</h1>
          <span className="customer-count">{total} clientes selecionados</span>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <div className="loading">Carregando clientes selecionados...</div>
        ) : (
          <>
            {customers.length === 0 ? (
              <div className="no-customers">Nenhum cliente selecionado</div>
            ) : (
              <>
                <div className="customers-grid">
                  {customers.map((customer, index) => (
                    <CustomerCard
                      key={customer.id || index}
                      customer={customer}
                      onEdit={handleEditCustomer}
                      onDelete={() => setCustomerToDelete(customer)}
                      onSelect={handleDeselectCustomer}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                    >
                      «
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        const distance = Math.abs(page - currentPage);
                        return distance <= 2 || page === 1 || page === totalPages;
                      })
                      .map((page, index, arr) => (
                        <React.Fragment key={page}>
                          {index > 0 && arr[index - 1] !== page - 1 && <span className="pagination-dots">...</span>}
                          <button
                            className={currentPage === page ? 'active' : ''}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      »
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {customers.length > 0 && (
          <button 
            className="clear-all-btn" 
            onClick={handleClearAllSelected}
            disabled={isClearing}
          >
            {isClearing ? 'Limpando...' : 'Limpar clientes selecionados'}
          </button>
        )}
      </div>

      {showUpdateModal && customerToEdit && (
        <UpdateCustomerModal
          isOpen={showUpdateModal}
          customer={customerToEdit}
          onClose={() => {
            setShowUpdateModal(false);
            setCustomerToEdit(null);
          }}
          onSubmit={handleUpdateCustomer}
        />
      )}

      {customerToDelete && (
        <ConfirmDeleteModal
          customer={customerToDelete}
          onConfirm={handleDeleteCustomer}
          onCancel={() => setCustomerToDelete(null)}
        />
      )}
    </div>
  );
}

