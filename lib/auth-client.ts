// Authentication API client for frontend
interface AuthResponse {
  success: boolean
  user?: {
    id: string
    email: string
    name: string
    createdAt: Date
    updatedAt: Date
  }
  token?: string
  error?: string
}

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
}

class AuthApiClient {
  private baseUrl = '/api/auth'
  private token: string | null = null

  constructor() {
    // Load token from localStorage on initialization (client-side only)
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  // Set token for authenticated requests
  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  // Get stored token
  getToken(): string | null {
    return this.token
  }

  // Make authenticated request
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest('/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      // Store token if registration successful
      if (response.success && response.token) {
        this.setToken(response.token)
      }

      return response
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Registration failed'
      }
    }
  }

  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest('/login', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      // Store token if login successful
      if (response.success && response.token) {
        this.setToken(response.token)
      }

      return response
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed'
      }
    }
  }

  // Get current user info
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      if (!this.token) {
        return {
          success: false,
          error: 'No authentication token'
        }
      }

      const response = await this.makeRequest('/me', {
        method: 'GET',
      })

      return response
    } catch (error: any) {
      // If token is invalid, clear it
      if (error.message.includes('Invalid token') || error.message.includes('No token')) {
        this.setToken(null)
      }
      
      return {
        success: false,
        error: error.message || 'Failed to get user info'
      }
    }
  }

  // Logout user
  logout() {
    this.setToken(null)
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token
  }
}

// Export singleton instance
export const authApiClient = new AuthApiClient()

// Export types
export type { AuthResponse, LoginData, RegisterData }
