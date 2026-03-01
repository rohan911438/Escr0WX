import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiService } from '@/lib/api';

interface User {
  walletAddress: string;
  nonce: number;
  reputationScore: number;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (walletAddress: string, signMessage: (message: string) => Promise<string>) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const TOKEN_KEY = 'escrowx_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        if (savedToken) {
          apiService.setAuthToken(savedToken);
          
          // Verify token is still valid by fetching profile
          const response = await apiService.getProfile();
          
          if (response.success && response.data) {
            setState(prev => ({
              ...prev,
              isAuthenticated: true,
              user: response.data,
              token: savedToken,
              isLoading: false,
            }));
            return;
          } else {
            // Token is invalid, remove it
            localStorage.removeItem(TOKEN_KEY);
            apiService.setAuthToken(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem(TOKEN_KEY);
        apiService.setAuthToken(null);
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (
    walletAddress: string, 
    signMessage: (message: string) => Promise<string>
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Step 1: Request authentication challenge
      const challengeResponse = await apiService.generateChallenge(walletAddress);
      
      if (!challengeResponse.success || !challengeResponse.data) {
        throw new Error(
          typeof challengeResponse.error === 'string' 
            ? challengeResponse.error 
            : challengeResponse.error?.message || 'Failed to generate challenge'
        );
      }
      
      const { challenge } = challengeResponse.data;
      
      // Step 2: Sign the challenge with the user's wallet
      const signature = await signMessage(challenge);
      
      // Step 3: Verify signature and get JWT token
      const verificationResponse = await apiService.verifySignature({
        walletAddress,
        challenge,
        signature,
      });
      
      if (!verificationResponse.success || !verificationResponse.data) {
        throw new Error(
          typeof verificationResponse.error === 'string'
            ? verificationResponse.error
            : verificationResponse.error?.message || 'Authentication failed'
        );
      }
      
      const { token, user } = verificationResponse.data;
      
      // Store token and update state
      localStorage.setItem(TOKEN_KEY, token);
      apiService.setAuthToken(token);
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
        error: null,
      }));
      
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    apiService.setAuthToken(null);
    
    setState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};