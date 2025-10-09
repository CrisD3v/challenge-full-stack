import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useReducer } from 'react';
import { apiService } from '../services/api';
import type { LoginData, RegisterData, User } from '../types';
import { authEvents } from '../utils/authEvents';

interface AuthState {
  usuario: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { usuario: User; token: string } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  usuario: null,
  token: null,
  isLoading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        usuario: action.payload.usuario,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        usuario: null,
        token: null,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        usuario: null,
        token: null,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);



  useEffect(() => {
    // Verificar si hay un token guardado al cargar la aplicación
    console.log('AuthProvider useEffect - Verificando localStorage...');
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');
    console.log('Token en localStorage:', token ? 'Presente' : 'Ausente');
    console.log('Usuario en localStorage:', usuarioGuardado ? 'Presente' : 'Ausente');

    if (token && usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        // console.log('Restaurando sesión desde localStorage:', usuario);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { usuario, token },
        });
      } catch (error) {
        console.error('Error al parsear usuario desde localStorage:', error);
        // Si hay error al parsear, limpiar el localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }
  }, []);

  const login = async (data: LoginData) => {
    try {
      console.log('Iniciando login en contexto...');
      dispatch({ type: 'LOGIN_START' });
      const response = await apiService.login(data);
      console.log('Respuesta del API:', response);

      // Guardar en localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('usuario', JSON.stringify(response.usuario));
      console.log('Datos guardados en localStorage');
      console.log('Token guardado:', response.token);
      console.log('Usuario guardado:', response.usuario);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          usuario: response.usuario,
          token: response.token,
        },
      });
      console.log('Login dispatch exitoso');

      // Handle login with cache management
      await authEvents.onLogin(response.usuario);
    } catch (error: any) {
      console.error('Error en login contexto:', error);
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await apiService.register(data);

      // Guardar en localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('usuario', JSON.stringify(response.usuario));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          usuario: response.usuario,
          token: response.token,
        },
      });

      // Handle login with cache management
      await authEvents.onLogin(response.usuario);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al registrarse';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      // Continuar con el logout aunque falle la llamada al servidor
      console.error('Error al hacer logout:', error);
    } finally {
      // Handle logout with cache cleanup
      await authEvents.onLogout();

      // Limpiar localStorage y estado
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
