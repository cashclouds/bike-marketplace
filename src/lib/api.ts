const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface ApiResponse<T> {
  error?: string;
  [key: string]: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(_token: string): void {
    // With httpOnly cookies, we don't store tokens in memory or localStorage
    // Cookies are automatically sent by the browser with each request
    console.log('[API] Token received - httpOnly cookie will be set by server');
  }

  clearToken(): void {
    // Logout will clear the cookies server-side
    console.log('[API] Token cleared');
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        console.error('[API] Error response data:', errorData);
        errorMessage = errorData.error || errorData.message || errorData.details || response.statusText;
      } catch (e) {
        // Try to get text if JSON parsing fails
        try {
          const errorText = await response.text();
          console.error('[API] Error response text:', errorText);
          if (errorText) errorMessage = errorText;
        } catch (e2) {
          console.error('[API] Could not parse error response');
        }
      }
      console.error(`[API] HTTP ${response.status}: ${errorMessage}`);
      throw new Error(`HTTP ${response.status}: ${errorMessage}`);
    }
    return response.json();
  }

  // Users API
  async registerUser(email: string, password: string, name: string, userType: string = 'individual', phone?: string) {
    const response = await fetch(`${this.baseUrl}/users/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, name, user_type: userType, phone }),
      credentials: 'include', // Include cookies in the request
      credentials: 'include',
    });
    const data = (await this.handleResponse(response)) as any;
    console.log('[API] registerUser: success - httpOnly cookie set by server');
    return data;
  }

  async loginUser(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/users/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Include cookies in the request
      credentials: 'include',
    });
    const data = (await this.handleResponse(response)) as any;
    console.log('[API] loginUser: success - httpOnly cookie set by server');
    return data;
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseUrl}/users/me`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getUser(userId: string) {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async updateUserProfile(name?: string, phone?: string) {
    const response = await fetch(`${this.baseUrl}/users/me`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, phone }),
      credentials: 'include',
      credentials: 'include',
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
      credentials: 'include',
    });

    const response = await fetch(`${this.baseUrl}/listings?${queryString.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getListing(id: string) {
    const response = await fetch(`${this.baseUrl}/listings/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
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
      credentials: 'include',
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
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async deleteListing(id: string) {
    const response = await fetch(`${this.baseUrl}/listings/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  // Brands API
  async getBrands() {
    const response = await fetch(`${this.baseUrl}/brands`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getBrand(id: string) {
    const response = await fetch(`${this.baseUrl}/brands/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getBrandModels(brandId: string) {
    const response = await fetch(`${this.baseUrl}/brands/${brandId}/models`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
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
      credentials: 'include',
    });

    const response = await fetch(`${this.baseUrl}/models?${queryString.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getModel(id: string) {
    const response = await fetch(`${this.baseUrl}/models/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
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
      credentials: 'include',
    });

    const response = await fetch(`${this.baseUrl}/components?${queryString.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getComponentCategories() {
    const response = await fetch(`${this.baseUrl}/components/categories`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async getComponent(id: string) {
    const response = await fetch(`${this.baseUrl}/components/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  // Favorites API
  async getFavorites() {
    const response = await fetch(`${this.baseUrl}/favorites`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async addToFavorites(listingId: string) {
    const response = await fetch(`${this.baseUrl}/favorites`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ listing_id: listingId }),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async removeFromFavorites(listingId: string) {
    const response = await fetch(`${this.baseUrl}/favorites/${listingId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }
}

export const api = new ApiClient(API_BASE_URL);
