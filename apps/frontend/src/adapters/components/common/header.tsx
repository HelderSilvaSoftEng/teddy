import React, { useState } from 'react';
import { useAuth } from '../../../presentation';
import './header.css';

export function Header() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span>🐻 Teddy</span>
        </div>

        <nav className="header-nav">
          <a href="/">Clientes</a>
          <a href="/selected-customers">Clientes selecionados</a>
        </nav>

        <div className="user-menu">
          <span className="user-name">{user?.name || user?.email}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
