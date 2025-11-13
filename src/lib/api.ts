const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface ApiResponse<T> {
  error?: string;
  [key: string]: any;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  private getHeaders(): HeadersInit {
    // Reload token from localStorage before each request to ensure we have the latest token
    this.loadToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Users API
  async registerUser(email: string, password: string, name: string, userType: string = 'individual', phone?: string) {
    const response = await fetch(`${this.baseUrl}/users/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, name, user_type: userType, phone }),
    });
    const data = (await this.handleResponse(response)) as any;
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async loginUser(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/users/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = (await this.handleResponse(response)) as any;
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseUrl}/users/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateUserProfile(name?: string, phone?: string) {
    const response = await fetch(`${this.baseUrl}/users/me`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, phone }),
    });
    return this.handleResponse(response);
  }

  // Listings API
  async getListings(params: {
    brand_id?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    year?: number;
    material?: string;
    condition?: string;
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, String(value));
      }
    });

    const response = await fetch(`${this.baseUrl}/listings?${queryString.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getListing(id: string) {
    const response = await fetch(`${this.baseUrl}/listings/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createListing(data: {
    brand_id: string;
    model_name: string;
    type: string;
    year?: number;
    material?: string;
    condition: string;
    price: number;
    currency?: string;
    location: string;
    description?: string;
    photos?: string[];
    payment_type?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/listings`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async updateListing(
    id: string,
    data: {
      price?: number;
      description?: string;
      condition?: string;
      location?: string;
      status?: string;
    }
  ) {
    const response = await fetch(`${this.baseUrl}/listings/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteListing(id: string) {
    const response = await fetch(`${this.baseUrl}/listings/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Brands API
  async getBrands() {
    const response = await fetch(`${this.baseUrl}/brands`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getBrand(id: string) {
    const response = await fetch(`${this.baseUrl}/brands/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getBrandModels(brandId: string) {
    const response = await fetch(`${this.baseUrl}/brands/${brandId}/models`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Models API
  async getModels(params: {
    brand_id?: string;
    type?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, String(value));
      }
    });

    const response = await fetch(`${this.baseUrl}/models?${queryString.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getModel(id: string) {
    const response = await fetch(`${this.baseUrl}/models/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Components API
  async getComponents(params: {
    category?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, String(value));
      }
    });

    const response = await fetch(`${this.baseUrl}/components?${queryString.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getComponentCategories() {
    const response = await fetch(`${this.baseUrl}/components/categories`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getComponent(id: string) {
    const response = await fetch(`${this.baseUrl}/components/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const api = new ApiClient(API_BASE_URL);
