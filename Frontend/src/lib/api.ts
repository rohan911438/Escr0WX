/**
 * API Service for EscrowX Frontend
 * 
 * Handles all HTTP communication with the backend API.
 * Uses native fetch API with consistent error handling and response formatting.
 */

import axios, { AxiosResponse, AxiosError } from 'axios';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string | {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasNext?: boolean;
  };
}

export interface CreateListingRequest {
  title: string;
  description: string;
  price: string;
  currency?: string;
  deliveryTime: number;
  category?: string;
}

export interface ListingFilters {
  status?: 'OPEN' | 'FULFILLED' | 'PROOF_PENDING' | 'VERIFIED' | 'RELEASED' | 'DISPUTED';
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface AuthChallenge {
  challenge: string;
  expiresAt: string;
}

export interface AuthVerification {
  walletAddress: string;
  challenge: string;
  signature: string;
}

export interface AuthResponse {
  token: string;
  user: {
    walletAddress: string;
    nonce: number;
    reputationScore: number;
  };
}

class ApiService {
  private baseURL: string;
  private authToken: string | null = null;
  private axiosInstance;

  constructor() {
    // Get API URL from environment variables with fallback
    const apiUrl = import.meta.env.VITE_API_URL || 'https://api.example.com/api';
    
    // Warn if no API URL is set but don't crash the app
    if (!import.meta.env.VITE_API_URL) {
      console.warn('VITE_API_URL environment variable not set. Using fallback URL. API features may not work.');
    }
    
    // Validate that we're not using localhost in production
    if (import.meta.env.MODE === 'production' && apiUrl.includes('localhost')) {
      console.error('Production build cannot use localhost URLs. Please set VITE_API_URL to your production backend URL.');
    }
    
    this.baseURL = apiUrl;
    
    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // Increased timeout for production
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false, // Enable if your backend requires cookies
    });

    // Add request interceptor to include auth token
    this.axiosInstance.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.data) {
          return Promise.reject(error.response.data);
        }
        return Promise.reject({
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: error.message || 'Network request failed'
          }
        });
      }
    );
  }

  /**
   * Set the authentication token for subsequent requests
   */
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  /**
   * Get the current authentication token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Make a GET request
   */
  private async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.get(endpoint, { params });
      return response.data;
    } catch (error: any) {
      return error;
    }
  }

  /**
   * Make a POST request
   */
  private async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      return error;
    }
  }

  /**
   * Make a PUT request
   */
  private async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.put(endpoint, data);
      return response.data;
    } catch (error: any) {
      return error;
    }
  }

  // Authentication APIs
  async generateChallenge(walletAddress: string): Promise<ApiResponse<AuthChallenge>> {
    return this.post<AuthChallenge>('/auth/challenge', { walletAddress });
  }

  async verifySignature(verification: AuthVerification): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>('/auth/verify', verification);
  }

  async getProfile(): Promise<ApiResponse<any>> {
    return this.get('/auth/profile');
  }

  // Listing APIs
  async getListings(filters?: ListingFilters): Promise<ApiResponse<any[]>> {
    return this.get('/listings', filters);
  }

  async getListingById(id: string): Promise<ApiResponse<any>> {
    return this.get(`/listings/${id}`);
  }

  async createListing(listing: CreateListingRequest): Promise<ApiResponse<any>> {
    return this.post('/listings', listing);
  }

  async fulfillListing(id: string): Promise<ApiResponse<any>> {
    return this.post(`/listings/${id}/fulfill`);
  }

  async submitProof(id: string, proofData: any): Promise<ApiResponse<any>> {
    return this.post(`/listings/${id}/proof`, proofData);
  }

  // Dashboard APIs
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.get('/dashboard/stats');
  }

  async getUserListings(pagination?: { limit?: number; offset?: number }): Promise<ApiResponse<any[]>> {
    return this.get('/dashboard/listings', pagination);
  }

  async getUserPurchases(pagination?: { limit?: number; offset?: number }): Promise<ApiResponse<any[]>> {
    return this.get('/dashboard/purchases', pagination);
  }

  async getPublicDashboard(address: string): Promise<ApiResponse<any>> {
    return this.get(`/users/${address}/dashboard`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.get('/health');
  }
}

// Export a singleton instance
export const apiService = new ApiService();
export default apiService;