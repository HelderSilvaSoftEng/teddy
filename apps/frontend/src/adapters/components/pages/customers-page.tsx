import React, { useState, useEffect } from 'react';
import { Customer } from '../../../domain';
import { ListCustomersUseCase, CreateCustomerUseCase, UpdateCustomerUseCase, DeleteCustomerUseCase } from '../../../application';
import { customerRepository } from '../../../infra';
import { Header, Sidebar } from '../common';
import { CustomerCard } from '../customer-card';
import { CreateCustomerModal } from '../modals/create-customer-modal';
import { UpdateCustomerModal } from '../modals/UpdateCustomerModal';
import { ConfirmDeleteModal } from '../modals/confirm-delete-modal';
import './customers-page.css';

const ITEMS_PER_PAGE = 16;

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const loadCustomers = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const skip = (page - 1) * ITEMS_PER_PAGE;
      const useCase = new ListCustomersUseCase(customerRepository);
      const result = await useCase.execute({ skip, take: ITEMS_PER_PAGE, search: 'ACTIVE', searchField: 'status' });
      setCustomers(result.data.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      setTotal(result.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar clientes';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(currentPage);
  }, [currentPage]);

  const handleCreateCustomer = async (data: Partial<Customer>) => {
    try {
      const useCase = new CreateCustomerUseCase(customerRepository);
      const newCustomer = await useCase.execute(data);
      setCustomers((prev) => [...prev, newCustomer].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      setShowCreateModal(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar cliente';
      setError(message);
    }
  };

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

  const handleSelectCustomer = async (customer: Customer) => {
    try {
      const useCase = new UpdateCustomerUseCase(customerRepository);
      const updatedCustomer = await useCase.execute(customer.id, { status: 'SELECTED' });
      if (updatedCustomer) {
        setCustomers((prev) =>
          prev.filter((c) => c.id !== customer.id)
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao selecionar cliente';
      setError(message);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="customers-layout">
      <Sidebar />
      <Header />

      <div className="customers-content">
        <div className="customers-header">
          <h1>👥 Clientes</h1>
          <span className="customer-count">{total} clientes encontrados</span>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {isLoading ? (
          <div className="loading">Carregando clientes...</div>
        ) : (
          <>
            <div className="customers-grid">
              {customers.length === 0 ? (
                <div className="no-customers">Nenhum cliente cadastrado</div>
              ) : (
                customers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onEdit={handleEditCustomer}
                    onDelete={() => setCustomerToDelete(customer)}
                    onSelect={handleSelectCustomer}
                  />
                ))
              )}
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
                  .filter((page) => Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages)
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

        <button className="create-customer-btn" onClick={() => setShowCreateModal(true)}>
          Criar cliente
        </button>
      </div>

      {showCreateModal && (
        <CreateCustomerModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCustomer}
        />
      )}

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
