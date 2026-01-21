import { createContext, useContext, useState, ReactNode } from 'react';
import { Customer } from '../../domain';

interface SelectedCustomersContextType {
  selectedCustomers: Customer[];
  toggleCustomer: (customer: Customer) => void;
  clearSelected: () => void;
}

const SelectedCustomersContext = createContext<SelectedCustomersContextType | undefined>(undefined);

export function SelectedCustomersProvider({ children }: { children: ReactNode }) {
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);

  const toggleCustomer = (customer: Customer) => {
    setSelectedCustomers((prev) => {
      const isSelected = prev.some((c) => c.id === customer.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== customer.id);
      } else {
        return [...prev, customer];
      }
    });
  };

  const clearSelected = () => {
    setSelectedCustomers([]);
  };

  const value: SelectedCustomersContextType = {
    selectedCustomers,
    toggleCustomer,
    clearSelected,
  };

  return (
    <SelectedCustomersContext.Provider value={value}>
      {children}
    </SelectedCustomersContext.Provider>
  );
}

export function useSelectedCustomers(): SelectedCustomersContextType {
  const context = useContext(SelectedCustomersContext);
  if (context === undefined) {
    throw new Error('useSelectedCustomers deve ser usado dentro de SelectedCustomersProvider');
  }
  return context;
}
