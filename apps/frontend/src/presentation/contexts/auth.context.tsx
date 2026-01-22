import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { ICurrentUser } from '../../domain';
import { tokenStorage } from '../../infra';
import { authRepository } from '../../infra/repositories/auth.repository';

interface AuthState {
  user: ICurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: ICurrentUser }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: ICurrentUser }
  | { type: 'CLEAR_ERROR' };

interface AuthContextType extends AuthState {
  setUser: (user: ICurrentUser) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  isAuthenticated: tokenStorage.isAuthenticated(),
  isLoading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Carregar usuário ao montar o provider se tiver token
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (tokenStorage.isAuthenticated() && !state.user) {
        try {
          dispatch({ type: 'LOGIN_START' });
          const user = await authRepository.getCurrentUser();
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } catch (error) {
          console.error('Erro ao carregar usuário atual:', error);
          tokenStorage.clear();
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    loadCurrentUser();
  }, []);

  // Recarregar usuário quando isAuthenticated muda para true (após login)
  useEffect(() => {
    const reloadUserAfterLogin = async () => {
      if (state.isAuthenticated && !state.user) {
        try {
          const user = await authRepository.getCurrentUser();
          dispatch({ type: 'SET_USER', payload: user });
        } catch (error) {
          console.error('Erro ao recarregar usuário após login:', error);
        }
      }
    };

    reloadUserAfterLogin();
  }, [state.isAuthenticated]);

  const setUser = (user: ICurrentUser) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const setLoading = (loading: boolean) => {
    if (loading) {
      dispatch({ type: 'LOGIN_START' });
    }
  };

  const setError = (error: string | null) => {
    if (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error });
    } else {
      dispatch({ type: 'CLEAR_ERROR' });
    }
  };

  const logout = () => {
    tokenStorage.clear();
    dispatch({ type: 'LOGOUT' });
  };

  const value: AuthContextType = {
    ...state,
    setUser,
    setLoading,
    setError,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
