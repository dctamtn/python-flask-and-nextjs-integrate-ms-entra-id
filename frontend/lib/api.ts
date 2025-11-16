import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add session token to requests if available
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('session_token');
    if (token) {
      config.headers['X-Session-Token'] = token;
    }
  }
  return config;
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, statusText } = error.response;
      
      if (status === 405) {
        console.error('❌ Method Not Allowed (405):', {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          message: 'The HTTP method is not allowed for this endpoint. Check if the Flask server is running and the route is correctly configured.',
        });
      } else if (status === 404) {
        console.error('❌ Not Found (404):', {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          message: 'The endpoint was not found. Check if the Flask server is running and the route exists.',
        });
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.error('❌ Network Error:', {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          message: 'Cannot connect to the Flask server. Make sure it is running on ' + API_URL,
        });
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ No Response from Server:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        message: 'The Flask server did not respond. Make sure it is running on ' + API_URL,
      });
    }
    
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  provider?: string;
  username?: string;
  password?: string;
  token?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  session_token: string;
  user: {
    user_id: string;
    username: string;
    email: string;
  };
}

export interface User {
  user_id: string;
  username: string;
  email: string;
}

export interface ValidateResponse {
  authenticated: boolean;
  user?: User;
  error?: string;
}

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/sso/login', credentials);
    if (response.data.session_token && typeof window !== 'undefined') {
      localStorage.setItem('session_token', response.data.session_token);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    if (token) {
      await apiClient.post('/auth/sso/logout', { session_token: token });
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('session_token');
    }
  },

  validate: async (): Promise<ValidateResponse> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    if (!token) {
      return { authenticated: false, error: 'No session token' };
    }
    try {
      const response = await apiClient.get<ValidateResponse>('/auth/sso/validate', {
        params: { session_token: token },
      });
      return response.data;
    } catch (error: any) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('session_token');
      }
      return { authenticated: false, error: error.response?.data?.error || 'Validation failed' };
    }
  },

  getProviders: async (): Promise<{ providers: Array<{ name: string; type: string; enabled: boolean }> }> => {
    const response = await apiClient.get('/auth/sso/providers');
    return response.data;
  },

  getAuthorizationUrl: async (provider: string = 'microsoft', redirectUri?: string): Promise<{ authorization_url: string; state: string }> => {
    const params = new URLSearchParams({ provider });
    if (redirectUri) {
      params.append('redirect_uri', redirectUri);
    }
    const response = await apiClient.get<{ authorization_url: string; state: string }>(`/auth/sso/authorize?${params.toString()}`);
    return response.data;
  },

  loginWithMicrosoft: async (): Promise<void> => {
    // Get authorization URL from backend
    const { authorization_url } = await authAPI.getAuthorizationUrl('microsoft');
    
    // Redirect to Microsoft login page
    if (typeof window !== 'undefined') {
      window.location.href = authorization_url;
    }
  },
};

export const userAPI = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/user/profile');
    return response.data;
  },
};

export const healthAPI = {
  check: async (): Promise<{ status: string; service: string }> => {
    const response = await apiClient.get('/api/health');
    return response.data;
  },
};

