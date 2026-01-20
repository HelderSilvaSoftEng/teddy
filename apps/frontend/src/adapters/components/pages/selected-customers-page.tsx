import React from 'react';
import { useSelectedCustomers } from '../../../presentation';
import { Header, Sidebar } from '../common';
import { CustomerCard } from '../customer-card';
import './customers-page.css';

export function SelectedCustomersPage() {
  const { selectedCustomers } = useSelectedCustomers();

  return (
    <div className="customers-layout">
      <Sidebar />
      <Header />

      <div className="customers-content">
        <div className="customers-header">
          <h1>⭐ Clientes Selecionados</h1>
          <span className="customer-count">{selectedCustomers.length} clientes selecionados</span>
        </div>

        {selectedCustomers.length === 0 ? (
          <div className="no-customers">Nenhum cliente selecionado</div>
        ) : (
          <div className="customers-grid">
            {selectedCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
