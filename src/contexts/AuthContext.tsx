import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, AuthAction, UserData, ENERGY_REFRESH_RATE, MAX_ENERGY } from '@/types/user';
import { checkAuthState } from '@/services/authService';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...initialState,
        loading: false
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    case 'UPDATE_HOLOBOT':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          holobots: state.user.holobots.map(h => 
            h.id === action.payload.id ? action.payload : h
          )
        } : null
      };
    case 'UPDATE_ENERGY':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          dailyEnergy: action.payload
        } : null
      };
    case 'ADD_HOLOS':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          holos: state.user.holos + action.payload
        } : null
      };
    case 'SUBTRACT_HOLOS':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          holos: Math.max(0, state.user.holos - action.payload)
        } : null
      };
    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
}>({ state: initialState, dispatch: () => null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        dispatch({ type: 'LOGIN_START' });
        const { isLoggedIn, userData } = checkAuthState();
        
        if (isLoggedIn && userData) {
          // Check if energy needs to be refreshed
          const now = Date.now();
          if (now - userData.lastEnergyRefresh >= ENERGY_REFRESH_RATE) {
            userData.dailyEnergy = MAX_ENERGY;
            userData.lastEnergyRefresh = now;
            
            // Update stored auth state
            localStorage.setItem('AUTH_STATE', JSON.stringify({
              isLoggedIn: true,
              userData
            }));
          }
          
          dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
        } else {
          dispatch({ type: 'LOGIN_FAILURE', payload: 'No stored credentials' });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Failed to initialize auth' });
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 