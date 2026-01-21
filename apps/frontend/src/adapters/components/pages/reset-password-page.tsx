import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authRepository } from '../../../infra';
import { ResetPasswordUseCase } from '../../../application';
import './reset-password-page.css';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="reset-container">
        <div className="reset-box">
          <h1>❌ Link inválido</h1>
          <p>O link de recuperação não foi fornecido ou expirou.</p>
          <Link to="/login" className="back-link">
            ← Voltar para o login
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: typeof errors = {};

    if (!newPassword) {
      validationErrors.password = 'Nova senha é obrigatória';
    } else if (newPassword.length < 6) {
      validationErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!confirmPassword) {
      validationErrors.confirm = 'Confirmação de senha é obrigatória';
    } else if (newPassword !== confirmPassword) {
      validationErrors.confirm = 'As senhas não coincidem';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const useCase = new ResetPasswordUseCase(authRepository);
      await useCase.execute({
        token,
        newPassword,
        confirmPassword,
      });
      setSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao resetar senha';
      setErrors({ password: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-container">
        <div className="reset-box">
          <h1>✅ Senha alterada com sucesso!</h1>
          <p className="success-message">Sua senha foi redefinida. Faça login com sua nova senha.</p>
          <Link to="/login" className="login-link">
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-container">
      <div className="reset-box">
        <h1>Redefinir Senha</h1>

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="form-group">
            <label>Nova senha:</label>
            <input
              type="password"
              placeholder="Digite a nova senha:"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrors({ ...errors, password: undefined });
              }}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirmar nova senha:</label>
            <input
              type="password"
              placeholder="Confirme a nova senha:"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors({ ...errors, confirm: undefined });
              }}
              className={errors.confirm ? 'input-error' : ''}
            />
            {errors.confirm && <span className="error-message">{errors.confirm}</span>}
          </div>

          <button type="submit" className="reset-btn" disabled={isLoading}>
            {isLoading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>

        <div className="reset-links">
          <Link to="/login" className="back-link">
            ← Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
