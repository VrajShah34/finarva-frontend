// services/api.ts
const BASE_URL = 'http://172.20.10.11:9991/api/gp';
export interface RegisterRequest {
  name: string;
  age: number;
  phone: string;
  email: string;
  password: string;
  language_preferred: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  _id: string;
  token: string;
  learner_id: string;
  message: string;
  modules_status?: string;
  language?: string;
}

export interface LoginResponse {
  _id: string;
  token: string;
  learner_id: string;
  modules_generated: boolean;
  modules_count: number;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  language_preferred: string;
  learner_id: string;
  wallet_balance: number;
  conversation_ids: string[];
  purchased_lead_ids: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProfileResponse {
  message: string;
  gp: UserProfile;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    requireAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      if (requireAuth) {
        const token = await this.getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          return {
            success: false,
            error: 'Authentication token not found',
          };
        }
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers,
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Something went wrong',
        };
      }

      return {
        success: true,
        data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    return this.makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile(): Promise<ApiResponse<ProfileResponse>> {
    return this.makeRequest('/profile', {
      method: 'GET',
    }, true);
  }
}

export const apiService = new ApiService();