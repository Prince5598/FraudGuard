import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthState, User } from '../types';

interface AuthContextProps {
  state: AuthState;
  login: (token: string, isAdmin: boolean) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isAdmin: localStorage.getItem('isAdmin') === 'true',
  loading: true,
};

type AuthAction =
  | { type: 'LOGIN'; payload: { token: string; isAdmin: boolean } }
  | { type: 'LOGOUT' }
  | { type: 'AUTH_LOADED'; payload: User }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'AUTH_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      try {
        const decoded = jwtDecode<{ user: User }>(action.payload.token);
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('isAdmin', String(action.payload.isAdmin));
        console.log('Decoded user:', decoded);
        return {
          ...state,
          token: action.payload.token,
          user: decoded,
          isAdmin: action.payload.isAdmin,
          isAuthenticated: true,
          loading: false,
        };
      } catch (err) {
        console.error('Failed to decode token:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        return {
          ...state,
          token: null,
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          loading: false,
        };
      }
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
      };
    case 'AUTH_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextProps>({
  state: initialState,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        dispatch({ type: 'AUTH_ERROR' });
        return;
      }
      
      try {
        const decoded = jwtDecode<{ user: User }>(token);
        dispatch({
          type: 'AUTH_LOADED',
          payload: decoded.user,
        });
      } catch (err) {
        console.error('Failed to decode token:', err);
        dispatch({ type: 'AUTH_ERROR' });
      }
    };
    
    loadUser();
  }, []);

  const login = (token: string, isAdmin: boolean) => {
    dispatch({
      type: 'LOGIN',
      payload: { token, isAdmin },
    });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user: Partial<User>) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: user,
    });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};