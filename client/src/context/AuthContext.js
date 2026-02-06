import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Configure axios base URL for API calls
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Initial state
const initialState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  AUTH_ERROR: 'AUTH_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        loading: false,
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    case AUTH_ACTIONS.AUTH_ERROR:
      return {
        ...initialState,
        loading: false,
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios interceptors
  useEffect(() => {
    // Request interceptor to add token to headers
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = Cookies.get('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          logout();
          toast.error('Session expired. Please login again.');
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      const response = await axios.get('/api/auth/me');
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.data.user,
          token,
        },
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      Cookies.remove('token');
      dispatch({ type: AUTH_ACTIONS.AUTH_ERROR });
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      // Store token in cookie (7 days)
      Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      toast.success(`Welcome back, ${user.name}!`);
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
      });

      const { token, user } = response.data;

      // Store token in cookie (7 days)
      Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      toast.success(`Welcome to Recipe Builder, ${user.name}!`);
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Google OAuth login
  const loginWithGoogle = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || '/api'}/auth/google`;
  };

  // Handle Google OAuth success
  const handleGoogleSuccess = (token) => {
    try {
      // Store token in cookie
      Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });
      
      // Check auth to get user data
      checkAuth();
      
      toast.success('Successfully logged in with Google!');
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Google authentication failed');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint (optional, for server-side cleanup)
      await axios.post('/api/auth/logout');
    } catch (error) {
      // Continue with logout even if server call fails
      console.error('Logout error:', error);
    } finally {
      // Remove token from cookie
      Cookies.remove('token');
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('/api/users/profile', userData);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data.data,
      });

      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Add to favorites
  const addToFavorites = async (recipeId) => {
    try {
      await axios.post(`/api/users/favorites/${recipeId}`);
      toast.success('Recipe added to favorites');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to favorites';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (recipeId) => {
    try {
      await axios.delete(`/api/users/favorites/${recipeId}`);
      toast.success('Recipe removed from favorites');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove from favorites';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    loginWithGoogle,
    handleGoogleSuccess,
    logout,
    updateProfile,
    addToFavorites,
    removeFromFavorites,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};