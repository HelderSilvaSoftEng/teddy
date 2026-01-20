import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authRepository } from '../../../infra';
import { RecoveryPasswordUseCase } from '../../../application';
import './recovery-password-page.css';

export function RecoveryPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email é obrigatório');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email inválido');
      return;
    }

    setIsLoading(true);

    try {
      const useCase = new RecoveryPasswordUseCase(authRepository);
      await useCase.execute({ email });
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar email';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="recovery-container">
        <div className="recovery-box">
          <h1>📧 Email enviado!</h1>
          <p className="success-message">
            Verificamos o email {email} em nossa base de dados. Se esse email existir, você receberá um link
            de recuperação em breve.
          </p>
          <p className="info-message">
            ℹ️ Verifique sua caixa de entrada ou pasta de spam. O link é válido por 30 minutos.
          </p>
          <Link to="/login" className="back-link">
            ← Voltar para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="recovery-container">
      <div className="recovery-box">
        <h1>Recuperar Senha</h1>

        <form onSubmit={handleSubmit} className="recovery-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Digite seu email:"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className={error && !email ? 'input-error' : ''}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <button type="submit" className="recovery-btn" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar código de confirmação'}
          </button>
        </form>

        <div className="recovery-links">
          <Link to="/login" className="back-link">
            ← Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
