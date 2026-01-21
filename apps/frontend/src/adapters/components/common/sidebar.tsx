import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../presentation';
import './sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const displayAccessCount = user?.accessCount ?? 0;

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header do Sidebar */}
        <div className="sidebar-header">
          <img src="/logo-Teddy.svg" alt="Teddy" className="sidebar-logo" />
          <button className="close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navegação */}
        <nav className="sidebar-nav">
          <button
            className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => handleNavigation('/')}
          >
            <span className="material-symbols-outlined">home</span>
            <span>Home</span>
          </button>
          <button
            className={`sidebar-link ${location.pathname === '/customers' ? 'active' : ''}`}
            onClick={() => handleNavigation('/customers')}
          >
            <span className="material-symbols-outlined">people</span>
            <span>Clientes</span>
          </button>
          <button
            className={`sidebar-link ${location.pathname === '/selected-customers' ? 'active' : ''}`}
            onClick={() => handleNavigation('/selected-customers')}
          >
            <span className="material-symbols-outlined">star</span>
            <span>Clientes selecionados</span>
          </button>
        </nav>

        {/* Footer com Contador de Acessos */}
        <div className="sidebar-footer">
          <div className="access-counter">
            <span className="material-symbols-outlined">visibility</span>
            <span className="counter-text">
              {displayAccessCount} {displayAccessCount === 1 ? 'acesso' : 'acessos'}
            </span>
          </div>
        </div>
      </div>

      {/* Backdrop/Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={() => onClose?.()} />}
    </>
  );
}
