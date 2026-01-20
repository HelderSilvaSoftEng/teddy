import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './sidebar.css';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setIsOpen(false)}>
          ✕
        </button>

        <nav className="sidebar-nav">
          <button
            className="sidebar-link"
            onClick={() => handleNavigation('/')}
          >
            🏠 Home
          </button>
          <button
            className="sidebar-link"
            onClick={() => handleNavigation('/customers')}
          >
            👥 Clientes
          </button>
          <button
            className="sidebar-link"
            onClick={() => handleNavigation('/selected-customers')}
          >
            ⭐ Clientes selecionados
          </button>
        </nav>
      </div>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
}
