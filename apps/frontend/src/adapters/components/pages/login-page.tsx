import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../presentation';
import { authRepository } from '../../../infra';
import { LoginUseCase } from '../../../application';
import './login-page.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: typeof errors = {};

    if (!email) {
      validationErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.email = 'Email inválido';
    }

    if (!password) {
      validationErrors.password = 'Senha é obrigatória';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const useCase = new LoginUseCase(authRepository);
      const result = await useCase.execute({ email, password });
      setUser(result.user);
      navigate('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Olá, seja bem-vindo!</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Digite o seu email:"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: undefined });
              }}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Digite a sua senha:"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: undefined });
              }}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-links">
          <Link to="/recovery-password" className="recovery-link">
            Esqueceu sua senha?
          </Link>
        </div>
      </div>
    </div>
  );
}
