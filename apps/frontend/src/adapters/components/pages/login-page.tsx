import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../presentation';
import { authRepository } from '../../../infra';
import { LoginUseCase } from '../../../application';
import './login-page.css';

interface LoginFormInputs {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setError } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFieldError,
  } = useForm<LoginFormInputs>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      // 1. Fazer login
      const useCase = new LoginUseCase(authRepository);
      await useCase.execute(data);

      // 2. Carregar dados do usuário após login
      const userData = await authRepository.getCurrentUser();
      setUser(userData);

      navigate('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      setError(message);
      
      // Se for erro de credenciais, destaca o email
      if (message.includes('Email') || message.includes('senha')) {
        setFieldError('email', { message });
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Olá, seja bem-vindo!</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Digite o seu email:"
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email inválido',
                },
              })}
              className={errors.email ? 'input-error' : ''}
              disabled={isSubmitting}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Digite a sua senha:"
              {...register('password', {
                required: 'Senha é obrigatória',
              })}
              className={errors.password ? 'input-error' : ''}
              disabled={isSubmitting}
            />
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
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
