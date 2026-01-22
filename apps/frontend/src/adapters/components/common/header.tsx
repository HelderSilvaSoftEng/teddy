import React, { useState } from 'react';
import { useAuth } from '../../../presentation';
import { Sidebar } from './sidebar';
import './header.css';

export function Header({ onOpenUserModal }: { onOpenUserModal?: () => void }) {
  const { user, logout } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);

  const getDisplayName = () => {
    const nameOrEmail = user?.name || user?.email || '';
    return nameOrEmail.split('@')[0];
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <button className="menu-btn" onClick={() => setShowSidebar(!showSidebar)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <img src="/logo-Teddy.svg" alt="Teddy" className="logo" />
          </div>

          <nav className="header-nav">
            <a href="/">Clientes</a>
            <a href="/selected-customers">Clientes selecionados</a>
          </nav>

          <div className="user-menu">
            <span className="user-name">Olá, {getDisplayName()}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </header>
      
      {showSidebar && (
        <Sidebar 
          isOpen={showSidebar} 
          onClose={() => setShowSidebar(false)}
          onOpenUserModal={onOpenUserModal}
        />
      )}
    </>
  );
}
