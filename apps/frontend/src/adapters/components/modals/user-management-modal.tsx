import React, { useState, useEffect } from 'react';
import type { IUser, ICreateUserRequest } from '../../../domain/users/user.types';
import { userService } from '../../../infra/services/user.service';
import './user-management-modal.css';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 5;

const getStatusLabel = (status: string) => {
  const labels: { [key: string]: string } = {
    'ACTIVE': '✅ Ativo',
    'INACTIVE': '⏸️ Inativo',
    'SUSPENDED': '🚫 Suspenso',
    'ARCHIVED': '📦 Arquivado',
  };
  return labels[status] || status;
};

export function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
  const [users, setUsers] = useState<IUser[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ICreateUserRequest & { statusField?: string }>({ 
    email: '', 
    password: '',
    statusField: 'ACTIVE'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);

  const loadUsers = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const skip = (page - 1) * ITEMS_PER_PAGE;
      const result = await userService.listUsers(skip, ITEMS_PER_PAGE);
      setUsers(result.data);
      setTotal(result.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar usuários';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers(currentPage);
    }
  }, [isOpen, currentPage]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      const newUser = await userService.createUser({
        email: formData.email,
        password: formData.password,
      });
      setUsers([newUser, ...users].slice(0, ITEMS_PER_PAGE));
      if (users.length < ITEMS_PER_PAGE) {
        setTotal(total + 1);
      }
      setFormData({ email: '', password: '', statusField: 'ACTIVE' });
      setShowForm(false);
    } catch (err) {
      let message = err instanceof Error ? err.message : 'Erro ao criar usuário';
      if (message.includes('duplicate') || message.includes('already exists')) {
        message = 'Este email já está cadastrado no sistema';
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await userService.deleteUser(userToDelete.id);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setTotal(total - 1);
      setUserToDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar usuário';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setIsSubmitting(true);
      setError(null);
      const updated = await userService.updateUser(editingUser.id, {
        email: formData.email,
      });
      setUsers(users.map(u => u.id === updated.id ? updated : u));
      setFormData({ email: '', password: '', statusField: 'ACTIVE' });
      setEditingUser(null);
      setShowForm(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar usuário';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (user: IUser) => {
    setEditingUser(user);
    setFormData({ email: user.email, password: '', statusField: user.status });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ email: '', password: '', statusField: 'ACTIVE' });
    setError(null);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Gestão de Usuários</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="modal-body">
          {!showForm ? (
            <>
              <div className="user-list-header">
                <h3>Usuários Cadastrados ({total})</h3>
                <button 
                  className="create-btn"
                  onClick={() => setShowForm(true)}
                >
                  + Novo Usuário
                </button>
              </div>

              {isLoading ? (
                <div className="loading">Carregando usuários...</div>
              ) : users.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhum usuário cadastrado</p>
                </div>
              ) : (
                <>
                  <div className="user-list">
                    {users.map((user) => (
                      <div key={user.id} className="user-row">
                        <div className="user-info">
                          <div className="user-email">{user.email}</div>
                          <div className="user-status">{getStatusLabel(user.status)}</div>
                          <div className="user-date">
                            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="user-actions">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEditClick(user)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => setUserToDelete(user)}
                            title="Deletar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
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
                          return distance <= 1 || page === 1 || page === totalPages;
                        })
                        .map((page, index, arr) => (
                          <React.Fragment key={page}>
                            {index > 0 && arr[index - 1] !== page - 1 && (
                              <span className="pagination-dots">...</span>
                            )}
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
          ) : (
            <>
              <div className="form-header">
                <h3>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              </div>
              <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="user-form">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isSubmitting}
                    placeholder="usuario@example.com"
                  />
                </div>

                {!editingUser && (
                  <div className="form-group">
                    <label htmlFor="password">Senha *</label>
                    <input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      disabled={isSubmitting}
                      placeholder="Digite uma senha"
                    />
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCloseForm}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Salvando...' : editingUser ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {userToDelete && (
          <div className="modal-overlay confirm" onClick={() => setUserToDelete(null)}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>Confirmar Exclusão</h3>
              <p>Tem certeza que deseja deletar o usuário <strong>{userToDelete.email}</strong>?</p>
              <div className="confirm-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setUserToDelete(null)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  className="delete-btn"
                  onClick={handleDeleteUser}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deletando...' : 'Deletar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
