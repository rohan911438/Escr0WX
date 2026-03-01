/**
 * Simple API Client for EscrowX Frontend
 * Connects to the simplified backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

class SimpleApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to backend',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // Health check
  async health(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // Get contract info
  async getContractAddress(): Promise<ApiResponse<{ address: string; network: string; chainId: number }>> {
    return this.request('/contract/address');
  }

  // Get network info
  async getNetworkInfo(): Promise<ApiResponse<{ network: string; chainId: number; rpcUrl: string; contractAddress: string }>> {
    return this.request('/contract/network');
  }

  // Get contract info
  async getContractInfo(): Promise<ApiResponse> {
    return this.request('/contract/info');
  }

  // Get listings (placeholder)
  async getListings(): Promise<ApiResponse> {
    return this.request('/listings');
  }
}

// Create and export singleton instance
export const apiClient = new SimpleApiClient();

// Export individual methods for convenience
export const {
  health,
  getContractAddress,
  getNetworkInfo,
  getContractInfo,
  getListings
} = apiClient;

export default apiClient;