/**
 * Centralized API configuration and fetch wrapper
 */

const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8001/api/v1'
};

const apiService = {
  /**
   * Generic request handler
   */
  async request(endpoint, options = {}) {
    try {
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const token = localStorage.getItem('auth_token');
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }

      const config = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      };

      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            // Handle FastAPI validation error arrays
            errorMessage = data.detail.map(err => {
              const field = err.loc && err.loc.length > 0 ? err.loc[err.loc.length - 1] : 'field';
              return `${field}: ${err.msg}`;
            }).join(', ');
          } else if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else {
            errorMessage = JSON.stringify(data.detail);
          }
        } else if (data.message) {
          errorMessage = data.message;
        }

        throw new Error(errorMessage);
      }

      return {
        success: true,
        data: data,
        error: null
      };

    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message || 'Network error occurred. Please try again.'
      };
    }
  },

  /**
   * Login user
   */
  async loginUser(credentials) {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    return this.request('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
  },

  /**
   * Register user (expects query parameters)
   */
  async registerUser(userData) {
    // Backend expects 'name', 'username', 'password', 'role' as query params
    const queryParams = new URLSearchParams({
      name: userData.name || userData.full_name || '',
      username: userData.username || '',
      password: userData.password || '',
      role: userData.role || 'viewer'
    });

    return this.request(`/auth/register?${queryParams.toString()}`, {
      method: 'POST',
      // No body since data is sent in query params
    });
  },

  /**
   * Fetch products
   */
  async getProducts(query = "") {
    const endpoint = query ? `/products/?search=${encodeURIComponent(query)}` : '/products/';
    return this.request(endpoint, {
      method: 'GET'
    });
  },

  /**
   * Add a new product
   */
  async addProduct(productData) {
    return this.request('/products/', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  /**
   * Update an existing product
   */
  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  /**
   * Delete a product
   */
  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }
};

// Export to global scope for our module-free setup
window.apiService = apiService;
